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

    for (size_t i = 0; i < vec.size(); i++) {
      [devices addObject:vec.at(i)];
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

RCT_EXPORT_METHOD(initialize : (NSString *)casId options : (NSDictionary *)
                      options resolver : (RCTPromiseResolveBlock)
                          resolve rejecter : (RCTPromiseRejectBlock)reject) {
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

  _casIdentifier = casId;

  // Tagged audience
  NSNumber *audience = options[@"targetAudience"];

  if (audience != nil) {
    CAS.settings.taggedAudience = (CASAudience)[audience integerValue];
  }

  // Initialize ad types
  CASInterstitial *interstitial = [[CASInterstitial alloc] initWithCasID:casId];
  interstitial.delegate = self;
  interstitial.impressionDelegate = self;
  self.interstitialAds = interstitial;

  CASRewarded *rewarded = [[CASRewarded alloc] initWithCasID:casId];
  rewarded.delegate = self;
  rewarded.impressionDelegate = self;
  self.rewardedAds = rewarded;

  CASAppOpen *appOpen = [[CASAppOpen alloc] initWithCasID:casId];
  appOpen.delegate = self;
  appOpen.impressionDelegate = self;
  self.appOpenAds = appOpen;

  CASNativeLoader *nativeLoader = [[CASNativeLoader alloc] initWithCasID:casId];
  nativeLoader.delegate = self;
  self.nativeLoader = nativeLoader;

  CASManagerBuilder *builder = [CAS buildManager];

  [builder withTestAdMode:[options[@"forceTestAds"] boolValue]];

  NSNumber *showConsent = options[@"showConsentFormIfRequired"];

  CASConsentFlow *consentFlow =
      [[CASConsentFlow alloc] initWithEnabled:[showConsent boolValue]];

  NSNumber *privacyGeo = options[@"debugGeography"];

  if (privacyGeo != nil) {
    consentFlow.debugGeography = (CASUserDebugGeography)[privacyGeo integerValue];
  }

  [builder withConsentFlow:consentFlow];

  [builder withFramework:@"ReactNative" version:options[@"reactNativeVersion"]];

  __block RCTPromiseResolveBlock resolveBlock = resolve;
  [builder withCompletionHandler:^(CASInitialConfig *_Nonnull config) {
    self.casInitConfig = [NSMutableDictionary dictionary];

    if (config.error) {
      self.casInitConfig[@"error"] = config.error;
    }

    if (config.countryCode) {
      self.casInitConfig[@"countryCode"] = config.countryCode;
    }

    self.casInitConfig[@"isConsentRequired"] = @(config.isConsentRequired);
    self.casInitConfig[@"consentFlowStatus"] = @(config.consentFlowStatus);

    if (resolveBlock) {
      resolveBlock(self.casInitConfig);
      resolveBlock = nil;
    }
  }];

  [builder createWithCasId:casId];
}

RCT_EXPORT_METHOD(isInitialized : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  BOOL initialized = (self.casInitConfig != nil);

  resolve(@(initialized));
}

RCT_EXPORT_METHOD(getSDKVersion : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
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
- (std::shared_ptr<TurboModule>)getTurboModule:
    (const ObjCTurboModule::InitParams &)params {
  return std::make_shared<NativeCASMobileAdsModuleSpecJSI>(params);
}

#endif

#pragma mark - Consent Flow

RCT_EXPORT_METHOD(showConsentFlow : (nonnull RCTPromiseResolveBlock)
                      resolve reject : (nonnull RCTPromiseRejectBlock)reject) {
  CASConsentFlow *flow = [[CASConsentFlow alloc] init];

  __block RCTPromiseResolveBlock resolveBlock = resolve;

  flow.completionHandler = ^(enum CASConsentFlowStatus status) {
    NSNumber *statusNumber = @(status);

    if (resolveBlock) {
      resolveBlock(statusNumber);
      resolveBlock = nil;
    }
  };
  [flow present];
}

#pragma mark - Settings

RCT_EXPORT_METHOD(setAdSoundsMuted : (BOOL)muted) {
  CASSettings *nativeSettings = CAS.settings;

  nativeSettings.mutedAdSounds = muted;
}

RCT_EXPORT_METHOD(setAppContentUrl : (NSString *)contentUrl) {
  CASTargetingOptions *targetingOptions = CAS.targetingOptions;

  targetingOptions.contentUrl = contentUrl;
}

RCT_EXPORT_METHOD(setAppKeywords : (NSArray *)keywords) {
  CASTargetingOptions *targetingOptions = CAS.targetingOptions;

  targetingOptions.keywords = keywords;
}

RCT_EXPORT_METHOD(setDebugLoggingEnabled : (BOOL)enabled) {
  CASSettings *nativeSettings = CAS.settings;

  nativeSettings.debugMode = enabled;
}

RCT_EXPORT_METHOD(setTrialAdFreeInterval : (long)interval) {
  CASSettings *nativeSettings = CAS.settings;

  nativeSettings.trialAdFreeInterval = interval;
}

RCT_EXPORT_METHOD(setUserAge : (long)age) {
  CASTargetingOptions *targetingOptions = CAS.targetingOptions;

  targetingOptions.age = age;
}

RCT_EXPORT_METHOD(setUserGender : (long)gender) {
  CASTargetingOptions *targetingOptions = CAS.targetingOptions;

  targetingOptions.gender = (CASGender)((NSInteger)gender);
}

RCT_EXPORT_METHOD(setLocationCollectionEnabled : (BOOL)enabled) {
  CASTargetingOptions *targetingOptions = CAS.targetingOptions;

  targetingOptions.locationCollectionEnabled = enabled;
}

#pragma mark - Interstitial

RCT_EXPORT_METHOD(isInterstitialAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  if (!self.interstitialAds) {
    resolve(@(NO));
    return;
  }

  resolve(@([self.interstitialAds isAdLoaded]));
}

RCT_EXPORT_METHOD(loadInterstitialAd) {
  if (!self.interstitialAds) {
    [self sendAdEvent:kOnInterstitialLoadFailed withError:CASError.notInitialized];
    return;
  }

  [self.interstitialAds loadAd];
}

RCT_EXPORT_METHOD(showInterstitialAd) {
  if (!self.interstitialAds) {
    [self sendAdEvent:kOnInterstitialFailedToShow withError:CASError.notInitialized];
    return;
  }

  [self.interstitialAds presentFromViewController:nil];
}

RCT_EXPORT_METHOD(setInterstitialMinInterval : (long)seconds) {
  if (self.interstitialAds) {
    self.interstitialAds.minInterval = seconds;
  }
}

RCT_EXPORT_METHOD(restartInterstitialInterval) {
  if (self.interstitialAds) {
    [self.interstitialAds restartInterval];
  }
}

RCT_EXPORT_METHOD(setInterstitialAutoloadEnabled : (BOOL)enabled) {
  if (self.interstitialAds) {
    self.interstitialAds.isAutoloadEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setInterstitialAutoshowEnabled : (BOOL)enabled) {
  if (self.interstitialAds) {
    self.interstitialAds.isAutoshowEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(destroyInterstitial) {
  if (self.interstitialAds) {
    [self.interstitialAds destroy];
    self.interstitialAds = [[CASInterstitial alloc] initWithCasID:_casIdentifier];
    self.interstitialAds.delegate = self;
    self.interstitialAds.impressionDelegate = self;
  }
}

#pragma mark - AppOpen

RCT_EXPORT_METHOD(isAppOpenAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  if (!self.appOpenAds) {
    resolve(@(NO));
    return;
  }

  resolve(@([self.appOpenAds isAdLoaded]));
}

RCT_EXPORT_METHOD(loadAppOpenAd) {
  if (!self.appOpenAds) {
    [self sendAdEvent:kOnAppOpenLoadFailed withError:CASError.notInitialized];
    return;
  }

  [self.appOpenAds loadAd];
}

RCT_EXPORT_METHOD(showAppOpenAd) {
  if (!self.appOpenAds) {
    [self sendAdEvent:kOnAppOpenFailedToShow withError:CASError.notInitialized];
    return;
  }

  [self.appOpenAds presentFromViewController:nil];
}

RCT_EXPORT_METHOD(setAppOpenAutoloadEnabled : (BOOL)enabled) {
  if (self.appOpenAds) {
    self.appOpenAds.isAutoloadEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(setAppOpenAutoshowEnabled : (BOOL)enabled) {
  if (self.appOpenAds) {
    self.appOpenAds.isAutoshowEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(destroyAppOpen) {
  if (self.appOpenAds) {
    [self.appOpenAds destroy];
    self.appOpenAds = [[CASAppOpen alloc] initWithCasID:_casIdentifier];
    self.appOpenAds.delegate = self;
    self.appOpenAds.impressionDelegate = self;
  }
}

#pragma mark - Rewarded

RCT_EXPORT_METHOD(isRewardedAdLoaded : (RCTPromiseResolveBlock)
                      resolve reject : (RCTPromiseRejectBlock)reject) {
  if (!self.rewardedAds) {
    resolve(@(NO));
    return;
  }

  resolve(@([self.rewardedAds isAdLoaded]));
}

RCT_EXPORT_METHOD(loadRewardedAd) {
  if (!self.rewardedAds) {
    [self sendAdEvent:kOnRewardedLoadFailed withError:CASError.notInitialized];
    return;
  }

  [self.rewardedAds loadAd];
}

RCT_EXPORT_METHOD(showRewardedAd) {
  if (!self.rewardedAds) {
    [self sendAdEvent:kOnRewardedFailedToShow withError:CASError.notInitialized];
    return;
  }

  [self.rewardedAds presentFromViewController:nil
                     userDidEarnRewardHandler:^(CASContentInfo *_Nonnull info) {
                       if (self.hasListeners) {
                         [self sendEventWithName:kOnRewardedCompleted body:nil];
                       }
                     }];
}

RCT_EXPORT_METHOD(setRewardedAutoloadEnabled : (BOOL)enabled) {
  if (self.rewardedAds) {
    self.rewardedAds.isAutoloadEnabled = enabled;
  }
}

RCT_EXPORT_METHOD(destroyRewarded) {
  if (self.rewardedAds) {
    [self.rewardedAds destroy];
    self.rewardedAds = [[CASRewarded alloc] initWithCasID:_casIdentifier];
    self.rewardedAds.delegate = self;
    self.rewardedAds.impressionDelegate = self;
  }
}

- (void)sendAdEvent:(NSString *)event withError:(CASError *)error {
  if (!self.hasListeners) {
    return;
  }

  [self sendEventWithName:event
                     body:@{@"code" : @(error.code), @"message" : error.description}];
}

#pragma mark - Native

RCT_EXPORT_METHOD(loadNativeAd : (long)maxNumberOfAds) {
  if (!self.nativeLoader) {
    [self sendAdEvent:kOnNativeAdFailedToLoad withError:CASError.notInitialized];
    return;
  }
  self.nativeLoader.delegate = self;

  [self.nativeLoader loadWithMaxNumberOfAds:maxNumberOfAds];
}

RCT_EXPORT_METHOD(setNativeMutedEnabled : (BOOL)enabled) {
  if (self.nativeLoader) {
    self.nativeLoader.isStartVideoMuted = enabled;
  }
}

RCT_EXPORT_METHOD(setNativeAdChoicesPlacement : (long)adChoicesPlacement) {
  if (self.nativeLoader) {
    self.nativeLoader.adChoicesPlacement =
        RNCASChoicesPlacementFromLong(adChoicesPlacement);
  }
}

RCT_EXPORT_METHOD(destroyNative : (long)instanceId) {
  NSNumber *instanceNumber = @(instanceId);

  CASNativeAdContent *content =
    [[RNCASNativeAdStore shared] removeNativeAdWithId:instanceNumber];

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

  [self sendEventWithName:kOnNativeAdLoaded body:instanceId];
}

- (void)nativeAd:(CASNativeAdContent *)ad didFailToLoadWithError:(CASError *)error {
  if (!self.hasListeners) {
    return;
  }
  [self sendAdEvent:kOnNativeAdFailedToLoad withError:error];
}

- (void)nativeAd:(CASNativeAdContent *)ad didFailToPresentWithError:(CASError *)error{
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
  impressionData[@"revenuePrecision"] =
      RNCASNSStringFromRevenuePresision(info.revenuePrecision);
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
  if (!style) return [UIFont systemFontOfSize:size];
  
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
