#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#else
#import <React/RCTView.h>
#import <React/RCTViewManager.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNCASNativeAssetView : RCTViewComponentView
#else
@interface RNCASNativeAssetView : RCTView
@property(nonatomic, assign) NSInteger assetType;
#endif
@end

#ifndef RCT_NEW_ARCH_ENABLED
@interface RNCASNativeAssetViewManager : RCTViewManager
@end

#endif

NS_ASSUME_NONNULL_END
