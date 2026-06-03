#import "CASMobileAds.h"
#import "RNCASNativeAdStore.h"
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
@property(nonatomic, strong, nullable) CASInterstitial *interstitialAds;
@property(nonatomic, strong, nullable) CASRewarded *rewardedAds;
@property(nonatomic, strong, nullable) CASAppOpen *appOpenAds;

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

#pragma mark - Interstitial Ads

- (BOOL)tryCreateInterstitialAds {
  if (self.interstitialAds) {
    return YES;
  }
  if (_casIdentifier.length == 0) {
    [self logErrorCallBeforeInitialize];
    return NO;
  }
  CASInterstitial *interstitial = [[CASInterstitial alloc] initWithCasID:_casIdentifier];
  interstitial.delegate = self;
  interstitial.impressionDelegate = self;
  self.interstitialAds = interstitial;
  return YES;
}

RCT_EXPORT_METHOD(isInterstitialAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  if (self.interstitialAds) {
    resolve(@([self.interstitialAds isAdLoaded]));
  } else {
    resolve(@(NO));
  }
}

RCT_EXPORT_METHOD(loadInterstitialAd) {
  if ([self tryCreateInterstitialAds]) {
    [self.interstitialAds loadAd];
  } else {
    [self sendAdEvent:kOnInterstitialLoadFailed withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(showInterstitialAd) {
  if ([self tryCreateInterstitialAds]) {
    [self.interstitialAds presentFromViewController:nil];
  } else {
    [self sendAdEvent:kOnInterstitialFailedToShow withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(setInterstitialMinInterval : (NSInteger)seconds) {
  if ([self tryCreateInterstitialAds]) {
    self.interstitialAds.minInterval = seconds;
  }
}

RCT_EXPORT_METHOD(restartInterstitialInterval) {
  if ([self tryCreateInterstitialAds]) {
    [self.interstitialAds restartInterval];
  }
}

RCT_EXPORT_METHOD(setInterstitialAutoloadEnabled : (BOOL)enabled) {
  if ([self tryCreateInterstitialAds]) {
    self.interstitialAds.isAutoloadEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setInterstitialAutoshowEnabled : (BOOL)enabled) {
  if ([self tryCreateInterstitialAds]) {
    self.interstitialAds.isAutoshowEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setInterstitialPlacement : (NSString *_Nullable)placement) {
  if ([self tryCreateInterstitialAds]) {
    self.interstitialAds.placement = placement;
  }
}

RCT_EXPORT_METHOD(destroyInterstitial) {
  if (self.interstitialAds) {
    [self.interstitialAds destroy];
    self.interstitialAds = nil;
  }
}

#pragma mark - AppOpen Ads

- (BOOL)tryCreateAppOpenAds {
  if (self.appOpenAds) {
    return YES;
  }
  if (_casIdentifier.length == 0) {
    [self logErrorCallBeforeInitialize];
    return NO;
  }
  CASAppOpen *appOpen = [[CASAppOpen alloc] initWithCasID:_casIdentifier];
  appOpen.delegate = self;
  appOpen.impressionDelegate = self;
  self.appOpenAds = appOpen;
  return YES;
}

RCT_EXPORT_METHOD(isAppOpenAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  if (self.appOpenAds) {
    resolve(@([self.appOpenAds isAdLoaded]));
  } else {
    resolve(@(NO));
  }
}

RCT_EXPORT_METHOD(loadAppOpenAd) {
  if ([self tryCreateAppOpenAds]) {
    [self.appOpenAds loadAd];
  } else {
    [self sendAdEvent:kOnAppOpenLoadFailed withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(showAppOpenAd) {
  if ([self tryCreateAppOpenAds]) {
    [self.appOpenAds presentFromViewController:nil];
  } else {
    [self sendAdEvent:kOnAppOpenFailedToShow withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(setAppOpenAutoloadEnabled : (BOOL)enabled) {
  if ([self tryCreateAppOpenAds]) {
    self.appOpenAds.isAutoloadEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setAppOpenAutoshowEnabled : (BOOL)enabled) {
  if ([self tryCreateAppOpenAds]) {
    self.appOpenAds.isAutoshowEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setAppOpenPlacement : (NSString *_Nullable)placement) {
  if ([self tryCreateAppOpenAds]) {
    self.appOpenAds.placement = placement;
  }
}

RCT_EXPORT_METHOD(destroyAppOpen) {
  if (self.appOpenAds) {
    [self.appOpenAds destroy];
    self.appOpenAds = nil;
  }
}

#pragma mark - Rewarded Ads

- (BOOL)tryCreateRewardedAds {
  if (self.rewardedAds) {
    return YES;
  }
  if (_casIdentifier.length == 0) {
    [self logErrorCallBeforeInitialize];
    return NO;
  }
  CASRewarded *rewarded = [[CASRewarded alloc] initWithCasID:_casIdentifier];
  rewarded.delegate = self;
  rewarded.impressionDelegate = self;
  self.rewardedAds = rewarded;
  return YES;
}

RCT_EXPORT_METHOD(isRewardedAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  if (self.rewardedAds) {
    resolve(@([self.rewardedAds isAdLoaded]));
  } else {
    resolve(@(NO));
  }
}

RCT_EXPORT_METHOD(loadRewardedAd) {
  if ([self tryCreateRewardedAds]) {
    [self.rewardedAds loadAd];
  } else {
    [self sendAdEvent:kOnRewardedLoadFailed withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(showRewardedAd) {
  if ([self tryCreateRewardedAds]) {
    [self.rewardedAds presentFromViewController:nil
                       userDidEarnRewardHandler:^(CASContentInfo *_Nonnull info) {
                         if (self.hasListeners) {
                           [self sendEventWithName:kOnRewardedCompleted body:nil];
                         }
                       }];
  } else {
    [self sendAdEvent:kOnRewardedFailedToShow withError:CASError.notInitialized];
  }
}

RCT_EXPORT_METHOD(setRewardedAutoloadEnabled : (BOOL)enabled) {
  if ([self tryCreateRewardedAds]) {
    self.rewardedAds.isAutoloadEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setRewardedPlacement : (NSString *_Nullable)placement) {
  if ([self tryCreateRewardedAds]) {
    self.rewardedAds.placement = placement;
  }
}

RCT_EXPORT_METHOD(setRewardedSSVerificationData : (NSString *_Nullable)data) {
  if ([self tryCreateRewardedAds]) {
    self.rewardedAds.serverSideVerificationData = data;
  }
}

RCT_EXPORT_METHOD(destroyRewarded) {
  if (self.rewardedAds) {
    [self.rewardedAds destroy];
    self.rewardedAds = nil;
  }
}

- (void)sendAdEvent:(NSString *)event withError:(CASError *)error {
  if (!self.hasListeners) {
    return;
  }

  [self sendEventWithName:event body:@{@"code" : @(error.code), @"message" : error.description}];
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

#pragma mark - CASScreenContentDelegate

- (void)screenAdDidLoadContent:(id<CASScreenContent>)ad {
  if (!self.hasListeners) {
    return;
  }

  if ([ad isKindOfClass:[CASRewarded class]]) {
    [self sendEventWithName:kOnRewardedLoaded body:nil];
  } else if ([ad isKindOfClass:[CASInterstitial class]]) {
    [self sendEventWithName:kOnInterstitialLoaded body:nil];
  } else if ([ad isKindOfClass:[CASAppOpen class]]) {
    [self sendEventWithName:kOnAppOpenLoaded body:nil];
  }
}

- (void)screenAd:(id<CASScreenContent>)ad didFailToLoadWithError:(CASError *)error {
  if (!self.hasListeners) {
    return;
  }

  if ([ad isKindOfClass:[CASRewarded class]]) {
    [self sendAdEvent:kOnRewardedLoadFailed withError:error];
  } else if ([ad isKindOfClass:[CASInterstitial class]]) {
    [self sendAdEvent:kOnInterstitialLoadFailed withError:error];
  } else if ([ad isKindOfClass:[CASAppOpen class]]) {
    [self sendAdEvent:kOnAppOpenLoadFailed withError:error];
  }
}

- (void)screenAdWillPresentContent:(id<CASScreenContent>)ad {
  if (!self.hasListeners) {
    return;
  }

  if ([ad isKindOfClass:[CASRewarded class]]) {
    [self sendEventWithName:kOnRewardedShowed body:nil];
  } else if ([ad isKindOfClass:[CASInterstitial class]]) {
    [self sendEventWithName:kOnInterstitialShowed body:nil];
  } else if ([ad isKindOfClass:[CASAppOpen class]]) {
    [self sendEventWithName:kOnAppOpenShowed body:nil];
  }
}

- (void)screenAd:(id<CASScreenContent>)ad didFailToPresentWithError:(CASError *)error {
  if (!self.hasListeners) {
    return;
  }

  if ([ad isKindOfClass:[CASRewarded class]]) {
    [self sendAdEvent:kOnRewardedFailedToShow withError:error];
  } else if ([ad isKindOfClass:[CASInterstitial class]]) {
    [self sendAdEvent:kOnInterstitialFailedToShow withError:error];
  } else if ([ad isKindOfClass:[CASAppOpen class]]) {
    [self sendAdEvent:kOnAppOpenFailedToShow withError:error];
  }
}

- (void)screenAdDidClickContent:(id<CASScreenContent>)ad {
  if (!self.hasListeners) {
    return;
  }

  if ([ad isKindOfClass:[CASRewarded class]]) {
    [self sendEventWithName:kOnRewardedClicked body:nil];
  } else if ([ad isKindOfClass:[CASInterstitial class]]) {
    [self sendEventWithName:kOnInterstitialClicked body:nil];
  } else if ([ad isKindOfClass:[CASAppOpen class]]) {
    [self sendEventWithName:kOnAppOpenClicked body:nil];
  }
}

- (void)screenAdDidDismissContent:(id<CASScreenContent>)ad {
  if (!self.hasListeners) {
    return;
  }

  if ([ad isKindOfClass:[CASRewarded class]]) {
    [self sendEventWithName:kOnRewardedHidden body:nil];
  } else if ([ad isKindOfClass:[CASInterstitial class]]) {
    [self sendEventWithName:kOnInterstitialHidden body:nil];
  } else if ([ad isKindOfClass:[CASAppOpen class]]) {
    [self sendEventWithName:kOnAppOpenHidden body:nil];
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
  if (!self.hasListeners) {
    return;
  }
  [self sendAdEvent:kOnNativeAdFailedToLoad withError:error];
}

- (void)nativeAd:(CASNativeAdContent *)ad didFailToPresentWithError:(CASError *)error {
  if (!self.hasListeners) {
    return;
  }
  [self sendAdEvent:kOnNativeAdFailedToShow withError:error];
}

- (void)nativeAdDidClick:(CASNativeAdContent *)ad {
  if (!self.hasListeners) {
    return;
  }
  [self sendEventWithName:kOnNativeAdClicked body:nil];
}

#pragma mark - CASImpressionDelegate

- (void)adDidRecordImpressionWithInfo:(CASContentInfo *_Nonnull)info {
  if (!self.hasListeners) {
    return;
  }

  NSDictionary *impressionData = RNCASNSDictionaryFromContentInfo(info);

  if ([info.format isEqual:CASFormat.interstitial]) {
    [self sendEventWithName:kOnInterstitialImpression body:impressionData];
  } else if ([info.format isEqual:CASFormat.rewarded]) {
    [self sendEventWithName:kOnRewardedImpression body:impressionData];
  } else if ([info.format isEqual:CASFormat.appOpen]) {
    [self sendEventWithName:kOnAppOpenImpression body:impressionData];
  } else if ([info.format isEqual:CASFormat.native]) {
    [self sendEventWithName:kOnNativeAdImpression body:impressionData];
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
