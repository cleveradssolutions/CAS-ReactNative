#ifndef RCT_NEW_ARCH_ENABLED
#import "RNCASNativeAdView.h"
#import <React/RCTViewManager.h>
#import "RNCASNativeAdViewComponent.h"

@interface RNCASNativeAdManager : RCTViewManager
@end

@implementation RNCASNativeAdManager

RCT_EXPORT_MODULE(CASNativeAdView)

// Export props
RCT_EXPORT_VIEW_PROPERTY(instanceId, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(width, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(height, CGFloat)

// Export types
RCT_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(headlineFontStyle, NSString)
RCT_EXPORT_VIEW_PROPERTY(secondaryFontStyle, NSString)

- (UIView *)view {
  RNCASNativeAdViewComponent *view = [RNCASNativeAdViewComponent new];
  return view;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

@end
#endif
