/*
 Implementation RNCASNativeAdView for RCT_NEW_ARCH_ENABLED
 React Native find this class by C function RNCASNativeAssetView() in end of mm file.
 
 For RCT_NEW_ARCH_ENABLED == NO used implementation in
 RNCASNativeAssetViewManager.mm and RNCASNativeAssetViewComponent.mm
 */
#ifdef RCT_NEW_ARCH_ENABLED

#import <UIKit/UIKit.h>
#import <React/RCTViewComponentView.h>

#ifndef RNCASNativeAssetView_h
#define RNCASNativeAssetView_h


@interface RNCASNativeAssetView : RCTViewComponentView

@end

#endif /* ifndef RNCASNativeAssetView_h */
#endif /* ifdef RCT_NEW_ARCH_ENABLED */
