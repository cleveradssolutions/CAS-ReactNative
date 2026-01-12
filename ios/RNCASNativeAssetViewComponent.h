#import <React/RCTView.h>
#import <UIKit/UIKit.h>

#ifndef RNCASNativeAssetViewComponent_h
#define RNCASNativeAssetViewComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface RNCASNativeAssetViewComponent : RCTView

/// Asset type index from JS NativeAdAssetType enum
@property (nonatomic, assign) NSInteger assetType;

@end

NS_ASSUME_NONNULL_END

#endif
