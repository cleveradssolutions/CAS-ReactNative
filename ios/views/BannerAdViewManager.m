#import <React/RCTViewManager.h>
#import <CleverAdsSolutions/CleverAdsSolutions.h>

@interface RCT_EXTERN_MODULE(BannerAdViewManager, RCTViewManager)

RCT_EXTERN_METHOD(loadNextAd:(nonnull NSNumber*) reactTag)
RCT_EXTERN_METHOD(isAdReady:(nonnull NSNumber*) reactTag)

RCT_EXPORT_VIEW_PROPERTY(size, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(refreshInterval, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(isAutoloadEnabled, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onAdViewLoaded, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdViewFailed, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdViewClicked, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(isAdReady, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdViewPresented, RCTBubblingEventBlock)

@end
