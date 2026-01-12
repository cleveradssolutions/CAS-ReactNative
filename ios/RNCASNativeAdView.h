/*
 Implementation RNCASNativeAdView for RCT_NEW_ARCH_ENABLED
 React Native find this class by C function RNCASNativeAdView() in end of mm file.
 
 For RCT_NEW_ARCH_ENABLED == NO used implementation in
 RNCASNativeAdManager.mm and RNCASNativeAdComponent.mm
 */
#ifdef RCT_NEW_ARCH_ENABLED

#import <UIKit/UIKit.h>
#import <React/RCTViewComponentView.h>

#ifndef RNCASNativeAdView_h
#define RNCASNativeAdView_h

@interface RNCASNativeAdView : RCTViewComponentView

/// JS → Native (Text assets)
- (void)registerAsset:(NSInteger)assetType reactTag:(NSInteger)reactTag;

/// Native → Native (View assets)
- (void)registerAssetView:(UIView *)view assetType:(NSInteger)assetType;

@end

#endif /* ifndef RNCASNativeAdView_h */
#endif /* ifdef RCT_NEW_ARCH_ENABLED */
