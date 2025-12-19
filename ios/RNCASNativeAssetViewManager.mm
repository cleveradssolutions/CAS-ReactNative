#ifndef RCT_NEW_ARCH_ENABLED
#import "RNCASNativeAdView.h"
#import <React/RCTViewManager.h>
#import "RNCASNativeAssetViewComponent.h"

@interface RNCASNativeAssetViewManager : RCTViewManager
@end

@implementation RNCASNativeAssetViewManager

RCT_EXPORT_MODULE(CASNativeAssetView)

- (UIView *)view {
  return [RNCASNativeAssetViewComponent new];
}

RCT_EXPORT_VIEW_PROPERTY(assetType, NSInteger)

@end
#endif
