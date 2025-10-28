#ifndef RCT_NEW_ARCH_ENABLED
#import "RNCASBannerAdComponent.h"
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface RNCASBannerAdManager : RCTViewManager
@end

@implementation RNCASBannerAdManager

RCT_EXPORT_MODULE(CASAdView)


// Export props
RCT_EXPORT_VIEW_PROPERTY(sizeConfig, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(casID, NSString)
RCT_EXPORT_VIEW_PROPERTY(autoReload, BOOL)
RCT_EXPORT_VIEW_PROPERTY(refreshInterval, NSInteger)

// Events
RCT_EXPORT_VIEW_PROPERTY(onAdViewLoaded, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdViewFailed, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdViewClicked, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onAdViewImpression, RCTDirectEventBlock)

// Commands
RCT_EXPORT_METHOD(loadAd:(nonnull NSNumber *)reactTag)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *,UIView *> *viewRegistry) {
    UIView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNCASBannerAdComponent class]]) {
      RCTLogError(@"Cannot find CASAdViewComponent with tag: #%@", reactTag);
      return;
    }
    [(RNCASBannerAdComponent *)view loadAd];
  }];
}

- (UIView *)view {
  RNCASBannerAdComponent *view = [RNCASBannerAdComponent new];
  return view;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

@end
#endif
