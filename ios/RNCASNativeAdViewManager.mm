#import "RNCASNativeAdView.h"
#import <React/RCTViewManager.h>

@interface RNCASNativeAdViewManager : RCTViewManager
@end

@implementation RNCASNativeAdViewManager

RCT_EXPORT_MODULE(RNCASNativeAdView)
RCT_EXPORT_VIEW_PROPERTY(width, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(height, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(templateStyle, NSDictionary)

- (UIView *)view {
  return [[RNCASNativeAdView alloc] init];
}

@end
