#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import "CASMobileAds.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNCASNativeAdAssetBinder : NSObject

/// check assets tag (101–112)
+ (BOOL)isAssetTag:(NSInteger)tag;

/// Created SDK asset view for tag
+ (UIView *)createSDKAssetView:(NSInteger)tag;

/// Register asset view on nativeView for tag
+ (void)registerAssetView:(UIView *)view
                   forTag:(NSInteger)tag
                nativeView:(CASNativeView *)nativeView;

/// Bind asset views wirh placeholders
+ (void)bindAssetsIfPossibleForNativeView:(CASNativeView *)nativeView
                            placeholders:(NSMutableDictionary<NSNumber *, UIView *> *)placeholders
                                   views:(NSMutableDictionary<NSNumber *, UIView *> *)views;

@end

NS_ASSUME_NONNULL_END
