#import "CASMobileAds.h"
#import "RNCASNativeAdStore.h"
#import "RNCASScreenAdPool.h"
#import <CleverAdsSolutions/CASInternalUtils.h>
#import <CleverAdsSolutions/CASTypeFlags.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import <CleverAdsSolutions/CleverAdsSolutions.h>
#import <React/RCTConvert.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTConversions.h>

using namespace facebook::react;
#endif

@interface CASMobileAds ()

@property(nonatomic, strong, nullable) NSMutableDictionary *casInitConfig;

/// Interstitial, Rewarded and App Open pools by RNCASScreenAdFormat, created on first use.
@property(nonatomic, strong) NSMutableDictionary<NSNumber *, RNCASScreenAdPool *> *screenAdPools;

@property(nonatomic, strong, nullable) CASNativeLoader *nativeLoader;

@property(nonatomic, assign) BOOL hasListeners;
@end

@implementation CASMobileAds

RCT_EXPORT_MODULE();

static NSString *_casIdentifier = @"";

+ (NSString *)casIdendifier {
  return _casIdentifier;
}

#pragma mark - Initialization

- (instancetype)init {
  self = [super init];

  if (self) {
    _screenAdPools = [[NSMutableDictionary alloc] initWithCapacity:3];
  }

  return self;
}

#ifdef RCT_NEW_ARCH_ENABLED

- (void)initialize:(nonnull NSString *)casId
           options:(JS::NativeCASMobileAdsModule::SpecInitializeOptions &)options
           resolve:(nonnull RCTPromiseResolveBlock)resolve
            reject:(nonnull RCTPromiseRejectBlock)reject {
  NSMutableDictionary *map = [[NSMutableDictionary alloc] initWithCapacity:6];

  map[@"forceTestAds"] = @(options.forceTestAds());
  map[@"reactNativeVersion"] = options.reactNativeVersion();
  map[@"showConsentFormIfRequired"] = @(options.showConsentFormIfRequired());

  if (auto val = options.targetAudience()) {
    map[@"targetAudience"] = @(*val);
  }

  if (auto val = options.debugGeography()) {
    map[@"debugGeography"] = @(*val);
  }

  if (options.testDeviceIds().has_value()) {
    auto vec = options.testDeviceIds().value();
    NSMutableArray *devices = [NSMutableArray arrayWithCapacity:vec.size()];

    for (const auto &device : vec) {
      [devices addObject:device];
    }

    map[@"testDeviceIds"] = devices;
  }

  id extras = options.mediationExtras();

  if (extras != nil && [extras isKindOfClass:[NSDictionary class]]) {
    map[@"mediationExtras"] = (NSDictionary *)extras;
  }

  [self internalInitWithCASID:casId options:map resolver:resolve rejecter:reject];
}

#else /* ifdef RCT_NEW_ARCH_ENABLED */

RCT_EXPORT_METHOD(initialize : (NSString *)casId options : (NSDictionary *)options resolver : (
    RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject) {
  [self internalInitWithCASID:casId options:options resolver:resolve rejecter:reject];
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */

- (void)internalInitWithCASID:(NSString *)casId
                      options:(NSDictionary *)options
                     resolver:(RCTPromiseResolveBlock)resolve
                     rejecter:(RCTPromiseRejectBlock)reject {
  if (self.casInitConfig && _casIdentifier == casId) {
    resolve(self.casInitConfig);
    return;
  }

  if (_casIdentifier.length > 0 && ![_casIdentifier isEqualToString:casId]) {
    NSMutableDictionary *configDict = [NSMutableDictionary dictionary];
    configDict[@"error"] = @"Only one CAS ID is supported per session";
    configDict[@"isConsentRequired"] = @(NO);
    configDict[@"consentFlowStatus"] = @(CASConsentFlowStatusUnknown);
    resolve(configDict);
    return;
  }

  _casIdentifier = casId;

  // Tagged audience
  NSNumber *audience = options[@"targetAudience"];

  if (audience != nil) {
    CAS.settings.taggedAudience = (CASAudience)[audience integerValue];
  }

  CASManagerBuilder *builder = [CAS buildManager];

  [builder withTestAdMode:[options[@"forceTestAds"] boolValue]];

  NSNumber *showConsent = options[@"showConsentFormIfRequired"];

  CASConsentFlow *consentFlow = [[CASConsentFlow alloc] initWithEnabled:[showConsent boolValue]];

  NSNumber *privacyGeo = options[@"debugGeography"];

  if (privacyGeo != nil) {
    consentFlow.debugGeography = (CASUserDebugGeography)[privacyGeo integerValue];
  }

  [builder withConsentFlow:consentFlow];

  [builder withFramework:@"ReactNative" version:options[@"reactNativeVersion"]];

  __block RCTPromiseResolveBlock resolveBlock = resolve;
  [builder withCompletionHandler:^(CASInitialConfig *_Nonnull config) {
    NSMutableDictionary *configDict = [NSMutableDictionary dictionary];

    if (config.countryCode) {
      configDict[@"countryCode"] = config.countryCode;
    }

    configDict[@"isConsentRequired"] = @(config.isConsentRequired);
    configDict[@"consentFlowStatus"] = @(config.consentFlowStatus);

    if (config.error) {
      configDict[@"error"] = config.error;
    } else {
      self.casInitConfig = configDict;
    }

    if (resolveBlock) {
      resolveBlock(self.casInitConfig);
      resolveBlock = nil;
    }
  }];

  [builder createWithCasId:casId];
}

RCT_EXPORT_METHOD(isInitialized : (RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)
                      reject) {
  BOOL initialized = (self.casInitConfig != nil);

  resolve(@(initialized));
}

- (void)logErrorCallBeforeInitialize {
  NSLog(@"[CAS.AI-RN] CASMobileAds must be initialized before calling ads functions");
}

RCT_EXPORT_METHOD(getSDKVersion : (RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)
                      reject) {
  resolve([CAS getSDKVersion]);
}

#pragma mark - Event Emitter

- (NSArray<NSString *> *)supportedEvents {
  return @[
    kOnAppOpenLoaded,        kOnAppOpenLoadFailed,      kOnAppOpenShowed,
    kOnAppOpenFailedToShow,  kOnAppOpenHidden,          kOnAppOpenClicked,
    kOnAppOpenImpression,    kOnInterstitialLoaded,     kOnInterstitialLoadFailed,
    kOnInterstitialClicked,  kOnInterstitialShowed,     kOnInterstitialFailedToShow,
    kOnInterstitialHidden,   kOnInterstitialImpression, kOnRewardedLoaded,
    kOnRewardedLoadFailed,   kOnRewardedClicked,        kOnRewardedShowed,
    kOnRewardedFailedToShow, kOnRewardedHidden,         kOnRewardedCompleted,
    kOnRewardedImpression,   kOnNativeAdLoaded,         kOnNativeAdFailedToLoad,
    kOnNativeAdImpression,   kOnNativeAdClicked,        kOnNativeAdFailedToShow
  ];
}

- (void)startObserving {
  self.hasListeners = YES;
}

- (void)stopObserving {
  self.hasListeners = NO;
}

- (void)sendAdEvent:(NSString *)event body:(id)body {
  if (!self.hasListeners) {
    return;
  }

  [self sendEventWithName:event body:body];
}

- (void)sendAdEvent:(NSString *)event withError:(CASError *)error {
  [self sendAdEvent:event body:@{@"code" : @(error.code), @"message" : error.description}];
}

// Invoke all exported methods from main queue
- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params {
  return std::make_shared<NativeCASMobileAdsModuleSpecJSI>(params);
}

#endif

#pragma mark - Consent Flow

RCT_EXPORT_METHOD(showConsentFlow : (nonnull RCTPromiseResolveBlock)
                      resolve reject : (nonnull RCTPromiseRejectBlock)reject) {
  CASConsentFlow *flow = [[CASConsentFlow alloc] init];

  __block RCTPromiseResolveBlock resolveBlock = resolve;

  flow.completionHandler = ^(enum CASConsentFlowStatus status) {
    if (resolveBlock) {
      NSNumber *statusNumber = @(status);
      resolveBlock(statusNumber);
      resolveBlock = nil;
    }
  };
  [flow present];
}

#pragma mark - Settings

RCT_EXPORT_METHOD(setAdSoundsMuted : (BOOL)muted) { CAS.settings.mutedAdSounds = muted; }

RCT_EXPORT_METHOD(setAppContentUrl : (NSString *)contentUrl) {
  CAS.targetingOptions.contentUrl = contentUrl;
}

RCT_EXPORT_METHOD(setAppKeywords : (NSArray *)keywords) {
  CAS.targetingOptions.keywords = keywords;
}

RCT_EXPORT_METHOD(setDebugLoggingEnabled : (BOOL)enabled) { CAS.settings.debugMode = enabled; }

RCT_EXPORT_METHOD(setTrialAdFreeInterval : (long)interval) {
  CAS.settings.trialAdFreeInterval = interval;
}

RCT_EXPORT_METHOD(setUserId : (NSString *_Nullable)identifier) {
  CAS.targetingOptions.userID = identifier;
}

RCT_EXPORT_METHOD(setUserAge : (long)age) { CAS.targetingOptions.age = age; }

RCT_EXPORT_METHOD(setUserGender : (long)gender) {
  CAS.targetingOptions.gender = (CASGender)((NSInteger)gender);
}

RCT_EXPORT_METHOD(setLocationCollectionEnabled : (BOOL)enabled) {
  CAS.targetingOptions.locationCollectionEnabled = enabled;
}

#pragma mark - Screen Ad Pools

/// Returns the pool of the format, creating it on first use. Nil before initialization.
- (nullable RNCASScreenAdPool *)poolWithFormat:(RNCASScreenAdFormat)format {
  RNCASScreenAdPool *pool = self.screenAdPools[@(format)];

  if (pool) {
    return pool;
  }

  if (_casIdentifier.length == 0) {
    [self logErrorCallBeforeInitialize];
    return nil;
  }

  pool = [[RNCASScreenAdPool alloc] initWithFormat:format casID:_casIdentifier module:self];
  self.screenAdPools[@(format)] = pool;
  return pool;
}

/// Returns the pool of the format only if it was created already.
- (nullable RNCASScreenAdPool *)existingPoolWithFormat:(RNCASScreenAdFormat)format {
  return self.screenAdPools[@(format)];
}

/// Destroys the pool. The next call creates a new pool with default options.
- (void)destroyPoolWithFormat:(RNCASScreenAdFormat)format {
  NSNumber *key = @(format);
  [self.screenAdPools[key] destroy];
  [self.screenAdPools removeObjectForKey:key];
}

- (void)loadAdWithFormat:(RNCASScreenAdFormat)format failEvent:(NSString *)failEvent {
  RNCASScreenAdPool *pool = [self poolWithFormat:format];

  if (pool) {
    [pool loadAd];
  } else {
    [self sendAdEvent:failEvent withError:CASError.notInitialized];
  }
}

- (void)showAdWithFormat:(RNCASScreenAdFormat)format failEvent:(NSString *)failEvent {
  RNCASScreenAdPool *pool = [self poolWithFormat:format];

  if (pool) {
    [pool showAd];
  } else {
    [self sendAdEvent:failEvent withError:CASError.notInitialized];
  }
}

#pragma mark - Interstitial Ads

RCT_EXPORT_METHOD(isInterstitialAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  resolve(@([self existingPoolWithFormat:RNCASScreenAdFormatInterstitial].loadedCount > 0));
}

RCT_EXPORT_METHOD(getInterstitialLoadedAdCount : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  resolve(@([self existingPoolWithFormat:RNCASScreenAdFormatInterstitial].loadedCount));
}

RCT_EXPORT_METHOD(setInterstitialPreloadedBufferSize : (NSInteger)count) {
  [[self poolWithFormat:RNCASScreenAdFormatInterstitial] setBufferSize:count];
}

RCT_EXPORT_METHOD(loadInterstitialAd) {
  [self loadAdWithFormat:RNCASScreenAdFormatInterstitial failEvent:kOnInterstitialLoadFailed];
}

RCT_EXPORT_METHOD(showInterstitialAd) {
  [self showAdWithFormat:RNCASScreenAdFormatInterstitial failEvent:kOnInterstitialFailedToShow];
}

RCT_EXPORT_METHOD(setInterstitialMinInterval : (NSInteger)seconds) {
  [[self poolWithFormat:RNCASScreenAdFormatInterstitial] setMinInterval:seconds];
}

RCT_EXPORT_METHOD(restartInterstitialInterval) {
  [[self poolWithFormat:RNCASScreenAdFormatInterstitial] restartInterval];
}

RCT_EXPORT_METHOD(setInterstitialAutoloadEnabled : (BOOL)enabled) {
  [[self poolWithFormat:RNCASScreenAdFormatInterstitial] setAutoloadEnabled:enabled];
}

RCT_EXPORT_METHOD(setInterstitialAutoshowEnabled : (BOOL)enabled) {
  [[self poolWithFormat:RNCASScreenAdFormatInterstitial] setAutoshowEnabled:enabled];
}

RCT_EXPORT_METHOD(setInterstitialPlacement : (NSString *_Nullable)placement) {
  [[self poolWithFormat:RNCASScreenAdFormatInterstitial] setPlacement:placement];
}

RCT_EXPORT_METHOD(destroyInterstitial) {
  [self destroyPoolWithFormat:RNCASScreenAdFormatInterstitial];
}

#pragma mark - AppOpen Ads

RCT_EXPORT_METHOD(isAppOpenAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  resolve(@([self existingPoolWithFormat:RNCASScreenAdFormatAppOpen].loadedCount > 0));
}

RCT_EXPORT_METHOD(getAppOpenLoadedAdCount : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  resolve(@([self existingPoolWithFormat:RNCASScreenAdFormatAppOpen].loadedCount));
}

RCT_EXPORT_METHOD(setAppOpenPreloadedBufferSize : (NSInteger)count) {
  [[self poolWithFormat:RNCASScreenAdFormatAppOpen] setBufferSize:count];
}

RCT_EXPORT_METHOD(loadAppOpenAd) {
  [self loadAdWithFormat:RNCASScreenAdFormatAppOpen failEvent:kOnAppOpenLoadFailed];
}

RCT_EXPORT_METHOD(showAppOpenAd) {
  [self showAdWithFormat:RNCASScreenAdFormatAppOpen failEvent:kOnAppOpenFailedToShow];
}

RCT_EXPORT_METHOD(setAppOpenAutoloadEnabled : (BOOL)enabled) {
  [[self poolWithFormat:RNCASScreenAdFormatAppOpen] setAutoloadEnabled:enabled];
}

RCT_EXPORT_METHOD(setAppOpenAutoshowEnabled : (BOOL)enabled) {
  [[self poolWithFormat:RNCASScreenAdFormatAppOpen] setAutoshowEnabled:enabled];
}

RCT_EXPORT_METHOD(setAppOpenPlacement : (NSString *_Nullable)placement) {
  [[self poolWithFormat:RNCASScreenAdFormatAppOpen] setPlacement:placement];
}

RCT_EXPORT_METHOD(destroyAppOpen) {
  [self destroyPoolWithFormat:RNCASScreenAdFormatAppOpen];
}

#pragma mark - Rewarded Ads

RCT_EXPORT_METHOD(isRewardedAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  resolve(@([self existingPoolWithFormat:RNCASScreenAdFormatRewarded].loadedCount > 0));
}

RCT_EXPORT_METHOD(getRewardedLoadedAdCount : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  resolve(@([self existingPoolWithFormat:RNCASScreenAdFormatRewarded].loadedCount));
}

RCT_EXPORT_METHOD(setRewardedPreloadedBufferSize : (NSInteger)count) {
  [[self poolWithFormat:RNCASScreenAdFormatRewarded] setBufferSize:count];
}

RCT_EXPORT_METHOD(loadRewardedAd) {
  [self loadAdWithFormat:RNCASScreenAdFormatRewarded failEvent:kOnRewardedLoadFailed];
}

RCT_EXPORT_METHOD(showRewardedAd) {
  [self showAdWithFormat:RNCASScreenAdFormatRewarded failEvent:kOnRewardedFailedToShow];
}

RCT_EXPORT_METHOD(setRewardedAutoloadEnabled : (BOOL)enabled) {
  [[self poolWithFormat:RNCASScreenAdFormatRewarded] setAutoloadEnabled:enabled];
}

RCT_EXPORT_METHOD(setRewardedPlacement : (NSString *_Nullable)placement) {
  [[self poolWithFormat:RNCASScreenAdFormatRewarded] setPlacement:placement];
}

RCT_EXPORT_METHOD(setRewardedSSVerificationData : (NSString *_Nullable)data) {
  [[self poolWithFormat:RNCASScreenAdFormatRewarded] setServerSideVerificationData:data];
}

RCT_EXPORT_METHOD(destroyRewarded) {
  [self destroyPoolWithFormat:RNCASScreenAdFormatRewarded];
}

#pragma mark - Native Ads

- (BOOL)tryCreateNativeLoader {
  if (self.nativeLoader) {
    return YES;
  }
  if (_casIdentifier.length == 0) {
    [self logErrorCallBeforeInitialize];
    return NO;
  }
  CASNativeLoader *loader = [[CASNativeLoader alloc] initWithCasID:_casIdentifier];
  loader.delegate = self;
  self.nativeLoader = loader;
  return YES;
}

RCT_EXPORT_METHOD(loadNativeAd : (NSInteger)maxNumberOfAds) {
  if ([self tryCreateNativeLoader]) {
    [self.nativeLoader loadWithMaxNumberOfAds:maxNumberOfAds];
  } else {
    [self sendAdEvent:kOnNativeAdFailedToLoad withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(setNativeMutedEnabled : (BOOL)enabled) {
  if ([self tryCreateNativeLoader]) {
    self.nativeLoader.isStartVideoMuted = enabled;
  }
}

RCT_EXPORT_METHOD(setNativeAdChoicesPlacement : (NSInteger)adChoicesPlacement) {
  if ([self tryCreateNativeLoader]) {
    self.nativeLoader.adChoicesPlacement = RNCASChoicesPlacementFromLong(adChoicesPlacement);
  }
}

RCT_EXPORT_METHOD(setNativePlacement : (NSString *_Nullable)placement) {
  if ([self tryCreateNativeLoader]) {
    self.nativeLoader.placement = placement;
  }
}

RCT_EXPORT_METHOD(isNativeExpired : (NSInteger)instanceId resolve : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  NSNumber *instanceNumber = @(instanceId);
  CASNativeAdContent *content = [[RNCASNativeAdStore shared] findNativeAdWithId:instanceNumber];

  resolve(@(!content || content.isExpired));
}

RCT_EXPORT_METHOD(destroyNative : (NSInteger)instanceId) {
  NSNumber *instanceNumber = @(instanceId);

  CASNativeAdContent *content = [[RNCASNativeAdStore shared] removeNativeAdWithId:instanceNumber];

  if (content) {
    content.delegate = nil;
    content.impressionDelegate = nil;
    [content destroy];
  }
}

#pragma mark - CASNativeAdDelegate

- (void)nativeAdDidLoadContent:(CASNativeAdContent *_Nonnull)ad {
  if (!self.hasListeners) {
    return;
  }

  NSNumber *instanceId = [[RNCASNativeAdStore shared] saveNativeAd:ad];

  ad.delegate = self;
  ad.impressionDelegate = self;

  NSMutableArray *content = [NSMutableArray arrayWithCapacity:12];

  // 0 — HEADLINE
  [content addObject:ad.headline ?: [NSNull null]];

  // 1 — BODY
  [content addObject:ad.body ?: [NSNull null]];

  // 2 — CALL TO ACTION
  [content addObject:ad.callToAction ?: [NSNull null]];

  // 3 — ADVERTISER
  [content addObject:ad.advertiser ?: [NSNull null]];

  // 4 — STORE
  [content addObject:ad.store ?: [NSNull null]];

  // 5 — PRICE
  [content addObject:ad.price ?: [NSNull null]];

  // 6 — REVIEW COUNT
  [content addObject:ad.reviewCount ?: [NSNull null]];

  // 7 - STAR RATING
  NSNumber *starRating = ad.starRating;
  if (starRating) {
    NSNumberFormatter *ratingFormatter = [[NSNumberFormatter alloc] init];
    [ratingFormatter setNumberStyle:NSNumberFormatterDecimalStyle];
    [ratingFormatter setMinimumFractionDigits:1];
    [ratingFormatter setMaximumFractionDigits:1];
    [content addObject:[ratingFormatter stringFromNumber:starRating]];
  } else {
    [content addObject:[NSNull null]];
  }

  // 8 — AD LABEL
  [content addObject:ad.adLabel ?: [NSNull null]];

  [self sendEventWithName:kOnNativeAdLoaded
                     body:@{@"instanceId" : instanceId, @"content" : content}];
}

- (void)nativeAd:(CASNativeAdContent *)ad didFailToLoadWithError:(CASError *)error {
  [self sendAdEvent:kOnNativeAdFailedToLoad withError:error];
}

- (void)nativeAd:(CASNativeAdContent *)ad didFailToPresentWithError:(CASError *)error {
  [self sendAdEvent:kOnNativeAdFailedToShow withError:error];
}

- (void)nativeAdDidClick:(CASNativeAdContent *)ad {
  [self sendAdEvent:kOnNativeAdClicked body:nil];
}

#pragma mark - CASImpressionDelegate

/// Native ads only: screen ads report impressions from RNCASScreenAdPool.
- (void)adDidRecordImpressionWithInfo:(CASContentInfo *_Nonnull)info {
  if ([info.format isEqual:CASFormat.native]) {
    [self sendAdEvent:kOnNativeAdImpression body:RNCASNSDictionaryFromContentInfo(info)];
  }
}

@end

#pragma mark - Plugin utilities

NSDictionary *RNCASNSDictionaryFromContentInfo(CASContentInfo *info) {
  NSMutableDictionary *impressionData = [NSMutableDictionary dictionary];

  impressionData[@"format"] = info.format.label;
  impressionData[@"sourceName"] = info.sourceName;
  impressionData[@"sourceUnitId"] = info.sourceUnitID;
  impressionData[@"revenue"] = @(info.revenue);
  impressionData[@"revenuePrecision"] = RNCASNSStringFromRevenuePresision(info.revenuePrecision);
  impressionData[@"impressionDepth"] = @(info.impressionDepth);
  impressionData[@"revenueTotal"] = @(info.revenueTotal);

  if (info.creativeID) {
    impressionData[@"creativeId"] = info.creativeID;
  }

  return impressionData;
}

NSString *RNCASNSStringFromRevenuePresision(CASRevenuePrecision precision) {
  switch (precision) {
  case CASRevenuePrecisionPrecise:
    return @"precise";

  case CASRevenuePrecisionFloor:
    return @"floor";

  case CASRevenuePrecisionEstimated:
    return @"estimated";

  default:
    return @"unknown";
  }
}

CASSize *RNCASSizeWithType(unichar sizeType, CGFloat maxWidth, CGFloat maxHeight) {
  switch (sizeType) {
  case 'B':
    return CASSize.banner;

  case 'L':
    return CASSize.leaderboard;

  case 'M':
    return CASSize.mediumRectangle;

  case 'S':
    return [CASSize getSmartBanner];

  case 'A':
    return [CASSize getAdaptiveBannerForMaxWidth:maxWidth];

  case 'I':
    return [CASSize getInlineBannerWithWidth:maxWidth maxHeight:maxHeight];

  default:
    return CASSize.banner;
  }
}

CASChoicesPlacement RNCASChoicesPlacementFromLong(long value) {
  switch (value) {
  case 0:
    return CASChoicesPlacementTopLeft;

  case 1:
    return CASChoicesPlacementTopRight;

  case 2:
    return CASChoicesPlacementBottomRight;

  case 3:
    return CASChoicesPlacementBottomLeft;

  default:
    return CASChoicesPlacementTopRight;
  }
}

UIFont *RNCASFontForStyle(NSString *style, UILabel *label) {
  CGFloat size = label.font.pointSize;
  if (!style)
    return [UIFont systemFontOfSize:size];

  NSString *s = style.lowercaseString;

  if ([s isEqualToString:@"bold"]) {
    return [UIFont boldSystemFontOfSize:size];
  }
  if ([s isEqualToString:@"italic"]) {
    return [UIFont italicSystemFontOfSize:size];
  }
  if ([s isEqualToString:@"medium"]) {
    return [UIFont systemFontOfSize:size weight:UIFontWeightMedium];
  }
  if ([s isEqualToString:@"monospace"]) {
    return [UIFont monospacedSystemFontOfSize:size weight:UIFontWeightRegular];
  }

  return [UIFont systemFontOfSize:size];
}