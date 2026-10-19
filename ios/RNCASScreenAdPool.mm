//
//  RNCASScreenAdPool.mm
//  CASMobileAds
//
//  Copyright © 2026 CleverAdsSolutions LTD, CAS.AI. All rights reserved.
//

#import "RNCASScreenAdPool.h"
#import "CASMobileAds.h"

@implementation RNCASScreenAdPool {
  NSString *_casID;
  __weak CASMobileAds *_module;

  /// CASInterstitial, CASRewarded or CASAppOpen instances, depending on _format.
  NSMutableArray<id<CASScreenContent>> *_slots;

  /// The slot on screen. Autoshow stays on it until the ad is dismissed.
  id<CASScreenContent> _presentedAd;

  // Options applied to every slot, including slots created later.
  BOOL _autoloadEnabled;
  BOOL _autoshowEnabled;
  NSString *_placement;
  NSInteger _minInterval;
  NSString *_ssvData;

  // JS event names of the format.
  NSString *_onLoaded;
  NSString *_onFailedToLoad;
  NSString *_onShowed;
  NSString *_onFailedToShow;
  NSString *_onClicked;
  NSString *_onDismissed;
  NSString *_onImpression;
}

- (instancetype)initWithFormat:(RNCASScreenAdFormat)format
                         casID:(NSString *)casID
                        module:(CASMobileAds *)module {
  self = [super init];

  if (self) {
    _format = format;
    _casID = casID;
    _module = module;
    _slots = [[NSMutableArray alloc] initWithCapacity:kRNCASMaxPreloadedAdsPerFormat];

    switch (format) {
    case RNCASScreenAdFormatRewarded:
      _onLoaded = kOnRewardedLoaded;
      _onFailedToLoad = kOnRewardedLoadFailed;
      _onShowed = kOnRewardedShowed;
      _onFailedToShow = kOnRewardedFailedToShow;
      _onClicked = kOnRewardedClicked;
      _onDismissed = kOnRewardedHidden;
      _onImpression = kOnRewardedImpression;
      break;

    case RNCASScreenAdFormatAppOpen:
      _onLoaded = kOnAppOpenLoaded;
      _onFailedToLoad = kOnAppOpenLoadFailed;
      _onShowed = kOnAppOpenShowed;
      _onFailedToShow = kOnAppOpenFailedToShow;
      _onClicked = kOnAppOpenClicked;
      _onDismissed = kOnAppOpenHidden;
      _onImpression = kOnAppOpenImpression;
      break;

    default:
      _onLoaded = kOnInterstitialLoaded;
      _onFailedToLoad = kOnInterstitialLoadFailed;
      _onShowed = kOnInterstitialShowed;
      _onFailedToShow = kOnInterstitialFailedToShow;
      _onClicked = kOnInterstitialClicked;
      _onDismissed = kOnInterstitialHidden;
      _onImpression = kOnInterstitialImpression;
      break;
    }

    // Same as the single instance before: one slot until the buffer size is set.
    [_slots addObject:[self createSlot]];
  }

  return self;
}

// MARK: - Pool

- (NSInteger)loadedCount {
  NSInteger count = 0;

  for (id<CASScreenContent> ad in _slots) {
    if (ad.isAdLoaded) {
      count++;
    }
  }

  return count;
}

- (void)setBufferSize:(NSInteger)size {
  NSInteger count = MAX(1, MIN(size, kRNCASMaxPreloadedAdsPerFormat));

  if (count != size) {
    NSLog(@"[CAS.AI-RN] Preloaded buffer size %ld is out of range 1...%d, %ld is used", (long)size,
          kRNCASMaxPreloadedAdsPerFormat, (long)count);
  }

  // Destroy unnecessary slots
  while (_slots.count > (NSUInteger)count) {
    id<CASScreenContent> ad = _slots.lastObject;
    [_slots removeLastObject];
    [self destroySlot:ad];
  }

  // Create new required slots
  while (_slots.count < (NSUInteger)count) {
    [_slots addObject:[self createSlot]];
  }

  [self updateAutoshowSlot];
}

- (void)loadAd {
  BOOL requested = NO;

  // A loaded slot answers loadAd with a repeated Loaded event, skip it.
  for (id<CASScreenContent> ad in _slots) {
    if (!ad.isAdLoaded) {
      [ad loadAd];
      requested = YES;
    }
  }

  // Everything is loaded: keep the single-ad behavior, one Loaded for the call.
  if (!requested) {
    [_slots.firstObject loadAd];
  }
}

- (void)showAd {
  // Without loaded slots the SDK reports the error (not ready, interval, ...) via delegate.
  id<CASScreenContent> ad = [self readyAd] ?: _slots.firstObject;

  switch (_format) {
  case RNCASScreenAdFormatRewarded: {
    __weak RNCASScreenAdPool *weakSelf = self;
    [(CASRewarded *)ad presentFromViewController:nil
                        userDidEarnRewardHandler:^(CASContentInfo *_Nonnull info) {
                          [weakSelf didEarnReward];
                        }];
    break;
  }

  case RNCASScreenAdFormatAppOpen:
    [(CASAppOpen *)ad presentFromViewController:nil];
    break;

  default:
    [(CASInterstitial *)ad presentFromViewController:nil];
    break;
  }
}

- (void)setAutoloadEnabled:(BOOL)enabled {
  _autoloadEnabled = enabled;

  for (id<CASScreenContent> ad in _slots) {
    ad.isAutoloadEnabled = enabled;
  }
}

- (void)setPlacement:(NSString *)placement {
  _placement = placement;

  // The SDK applies the placement on the next load only.
  for (id<CASScreenContent> ad in _slots) {
    ad.placement = placement;
  }
}

- (void)setAutoshowEnabled:(BOOL)enabled {
  if (_format == RNCASScreenAdFormatRewarded) {
    return;
  }

  _autoshowEnabled = enabled;
  [self updateAutoshowSlot];
}

- (void)setMinInterval:(NSInteger)seconds {
  if (_format != RNCASScreenAdFormatInterstitial) {
    return;
  }

  _minInterval = seconds;

  for (CASInterstitial *ad in _slots) {
    ad.minInterval = seconds;
  }
}

- (void)restartInterval {
  if (_format != RNCASScreenAdFormatInterstitial) {
    return;
  }

  // The interval timer is shared by the SDK, restarting it on every slot is safe.
  for (CASInterstitial *ad in _slots) {
    [ad restartInterval];
  }
}

- (void)setServerSideVerificationData:(NSString *)data {
  if (_format != RNCASScreenAdFormatRewarded) {
    return;
  }

  _ssvData = data;

  for (CASRewarded *ad in _slots) {
    ad.serverSideVerificationData = data;
  }
}

- (void)destroy {
  for (id<CASScreenContent> ad in _slots) {
    [self destroySlot:ad];
  }

  [_slots removeAllObjects];
}

// MARK: - Private

/// Loaded slot with the highest price. A shown ad stays in its slot: it stops being loaded on
/// present and loads new content after the impression.
/// Slots without content info lose to priced ones; with equal price the earlier slot wins,
/// so without any price info this is the first loaded slot.
- (nullable id<CASScreenContent>)readyAd {
  id<CASScreenContent> bestAd = nil;
  double bestPrice = -1.0;

  for (id<CASScreenContent> ad in _slots) {
    if (!ad.isAdLoaded) {
      continue;
    }
    
    CASContentInfo *info = ad.contentInfo;
    double price = info ? info.revenue : -1.0;

    if (!bestAd || price > bestPrice) {
      bestAd = ad;
      bestPrice = price;
    }
  }

  return bestAd;
}

/// Creates a slot for the pool format with delegates and current options.
- (id<CASScreenContent>)createSlot {
  id<CASScreenContent> ad;

  switch (_format) {
  case RNCASScreenAdFormatRewarded: {
    CASRewarded *rewarded = [[CASRewarded alloc] initWithCasID:_casID];
    rewarded.serverSideVerificationData = _ssvData;
    ad = rewarded;
    break;
  }

  case RNCASScreenAdFormatAppOpen:
    ad = [[CASAppOpen alloc] initWithCasID:_casID];
    break;

  default: {
    CASInterstitial *interstitial = [[CASInterstitial alloc] initWithCasID:_casID];
    interstitial.minInterval = _minInterval;
    ad = interstitial;
    break;
  }
  }

  ad.delegate = self;
  ad.impressionDelegate = self;
  ad.placement = _placement;
  
  ad.isAutoloadEnabled = _autoloadEnabled;

  return ad;
}

- (void)destroySlot:(id<CASScreenContent>)ad {
  if (ad == _presentedAd) {
    _presentedAd = nil;
  }

  ad.delegate = nil;
  ad.impressionDelegate = nil;
  [ad destroy];
}

/// Keeps autoshow on a single slot, so the app return shows one ad at most:
/// the loaded slot with the highest price, or the first slot while nothing is loaded.
/// While an ad is on screen, autoshow stays on its slot until it is dismissed.
- (void)updateAutoshowSlot {
  if (_format == RNCASScreenAdFormatRewarded) {
    return;
  }

  if (_autoshowEnabled && _presentedAd) {
    return;
  }

  id<CASScreenContent> owner = _autoshowEnabled ? ([self readyAd] ?: _slots.firstObject) : nil;

  for (id<CASScreenContent> ad in _slots) {
    BOOL enabled = (ad == owner);

    if (_format == RNCASScreenAdFormatAppOpen) {
      ((CASAppOpen *)ad).isAutoshowEnabled = enabled;
    } else {
      ((CASInterstitial *)ad).isAutoshowEnabled = enabled;
    }
  }
}

- (void)didEarnReward {
  [_module sendAdEvent:kOnRewardedCompleted body:nil];
}

// MARK: - CASScreenContentDelegate

- (void)screenAdDidLoadContent:(id<CASScreenContent>)ad {
  [self updateAutoshowSlot];
  [_module sendAdEvent:_onLoaded body:nil];
}

- (void)screenAd:(id<CASScreenContent>)ad didFailToLoadWithError:(CASError *)error {
  [self updateAutoshowSlot];
  [_module sendAdEvent:_onFailedToLoad withError:error];
}

- (void)screenAdWillPresentContent:(id<CASScreenContent>)ad {
  _presentedAd = ad;
  [_module sendAdEvent:_onShowed body:nil];
}

- (void)screenAd:(id<CASScreenContent>)ad didFailToPresentWithError:(CASError *)error {
  if (ad == _presentedAd) {
    _presentedAd = nil;
  }

  [self updateAutoshowSlot];
  [_module sendAdEvent:_onFailedToShow withError:error];
}

- (void)screenAdDidClickContent:(id<CASScreenContent>)ad {
  [_module sendAdEvent:_onClicked body:nil];
}

- (void)screenAdDidDismissContent:(id<CASScreenContent>)ad {
  if (ad == _presentedAd) {
    _presentedAd = nil;
  }

  [self updateAutoshowSlot];
  [_module sendAdEvent:_onDismissed body:nil];
}

// MARK: - CASImpressionDelegate

- (void)adDidRecordImpressionWithInfo:(CASContentInfo *)info {
  [_module sendAdEvent:_onImpression body:RNCASNSDictionaryFromContentInfo(info)];
}

@end
