#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTViewComponentView.h>
#else
#import <React/RCTView.h>
#import <React/RCTViewManager.h>
#endif

NS_ASSUME_NONNULL_BEGIN

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNCASNativeAdView : RCTViewComponentView
#else
@interface RNCASNativeAdView : RCTView

@property (nonatomic, assign) NSInteger instanceId;

// Ad view size
@property (nonatomic, assign) CGFloat width;
@property (nonatomic, assign) CGFloat height;

// Templates
@property (nonatomic, assign) Boolean usesTemplate;

// Colors
@property (nonatomic, strong, nullable) UIColor *backgroundColor;
@property (nonatomic, strong, nullable) UIColor *primaryColor;
@property (nonatomic, strong, nullable) UIColor *primaryTextColor;
@property (nonatomic, strong, nullable) UIColor *headlineTextColor;
@property (nonatomic, strong, nullable) UIColor *secondaryTextColor;

// Font style
@property (nonatomic, copy, nullable) NSString *headlineFontStyle;
@property (nonatomic, copy, nullable) NSString *secondaryFontStyle;

#endif

// JS → Native (Text assets)
- (void)registerAsset:(NSInteger)assetType reactTag:(NSInteger)reactTag;

// Native → Native (View assets)
- (void)registerAssetView:(UIView *)view assetType:(NSInteger)assetType;

@end

#ifndef RCT_NEW_ARCH_ENABLED

@interface RNCASNativeAdViewManager : RCTViewManager
@end

#endif

NS_ASSUME_NONNULL_END
