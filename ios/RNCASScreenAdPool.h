//
//  RNCASScreenAdPool.h
//  CASMobileAds
//
//  Copyright © 2026 CleverAdsSolutions LTD, CAS.AI. All rights reserved.
//

#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import <Foundation/Foundation.h>

@class CASMobileAds;

NS_ASSUME_NONNULL_BEGIN

/// Upper bound of preloaded ads per screen format.
#define kRNCASMaxPreloadedAdsPerFormat 4

typedef NS_ENUM(NSInteger, RNCASScreenAdFormat) {
  RNCASScreenAdFormatInterstitial = 0,
  RNCASScreenAdFormatRewarded = 1,
  RNCASScreenAdFormatAppOpen = 2,
};

/// All Interstitial, Rewarded or App Open ads of the module, and their JS events.
///
/// The pool keeps 1...4 slots (preloaded buffer size, 1 by default).
/// Slots are long-lived SDK instances: a shown ad stays in its slot and loads new content
/// by itself when autoload is enabled, or on the next `loadAd`.
///
/// Options (autoload, placement, autoshow, min interval, SSV data) are stored in the pool
/// and applied to every slot, including slots created later.
///
/// The pool is the delegate and impression delegate of every slot and sends JS events
/// through the module.
@interface RNCASScreenAdPool : NSObject <CASScreenContentDelegate, CASImpressionDelegate>

- (instancetype)initWithFormat:(RNCASScreenAdFormat)format
                         casID:(NSString *)casID
                        module:(CASMobileAds *)module NS_DESIGNATED_INITIALIZER;

- (instancetype)init NS_UNAVAILABLE;

@property(nonatomic, readonly) RNCASScreenAdFormat format;

/// Number of slots with loaded content.
@property(nonatomic, readonly) NSInteger loadedCount;

/// Size 1...kRNCASMaxPreloadedAdsPerFormat preloads ads: sets the number of slots
/// and enables autoload for every slot. Bigger values are clamped.
/// Size < 1 turns preloading off: one slot with the autoload option set by the app.
/// Surplus slots are destroyed from the end, new slots get the current options.
- (void)setBufferSize:(NSInteger)size;

/// Requests content for every slot.
- (void)loadAd;

/// Presents the loaded slot with the highest price (contentInfo.revenue).
/// Without loaded slots presents the first slot, so the SDK reports the error to JS.
- (void)showAd;

- (void)setAutoloadEnabled:(BOOL)enabled;
- (void)setPlacement:(nullable NSString *)placement;

/// Interstitial and App Open only. Applied to every slot, the SDK decides
/// which ad is shown on app return.
- (void)setAutoshowEnabled:(BOOL)enabled;

/// Interstitial only.
- (void)setMinInterval:(NSInteger)seconds;

/// Interstitial only.
- (void)restartInterval;

/// Rewarded only.
- (void)setServerSideVerificationData:(nullable NSString *)data;

/// Destroys every slot.
- (void)destroy;

@end

NS_ASSUME_NONNULL_END