#ifdef RCT_NEW_ARCH_ENABLED
#import "CASMobileAds.h"
#import "RNCASNativeAdView.h"
#import "RNCASNativeAdStore.h"
#import "RNCASNativeAdAssetBinder.h"
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import <React/RCTConversions.h>
#import "RCTFabricComponentsPlugins.h"

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNCASNativeAdView () <RCTCASNativeAdViewViewProtocol>
@property (nonatomic, strong, nullable) CASNativeView *nativeView;
@property (nonatomic, assign) int appliedInstanceId;

/// assetType(tag) -> sdk asset view
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, UIView *> *assetViews;
/// assetType(tag) -> placeholder view
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, UIView *> *assetPlaceholders;
@end

@implementation RNCASNativeAdView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
    return concreteComponentDescriptorProvider<CASNativeAdViewComponentDescriptor>();
}

/// Order of function calls
/// 1. `initWithFrame` – creation of the container
/// 2. `updateProps` – updating parameters when ``CASNativeAdViewProps`` change
/// 3. `prepareForRecycle` – when the view is unmounted
/// 4. After that, the same container can be reused for another mount, starting from step 2.
/// Recycle enabled by default and can be disabled by function:
/// ```
/// + (BOOL)shouldBeRecycled {
///   return NO;
/// }
/// ```
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const CASNativeAdViewProps>();
        _props = defaultProps;
        _appliedInstanceId = -1;
        _assetViews = [NSMutableDictionary new];
        _assetPlaceholders = [NSMutableDictionary new];
    }
  
    return self;
}

- (void)layoutSubviews {
  [super layoutSubviews];

  for (NSNumber *key in self.assetPlaceholders) {
    UIView *placeholder = self.assetPlaceholders[key];
    UIView *assetView = self.assetViews[key];

    if (placeholder && assetView) {
      assetView.frame = placeholder.bounds;
    }
  }
}


#pragma mark - Props update

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<const CASNativeAdViewProps>(props);

  // 1. Ensure CASNativeView
  if (!self.nativeView) {
    self.nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];

    self.nativeView.translatesAutoresizingMaskIntoConstraints = YES;
    [self addSubview:self.nativeView];
  }

  // 2. Update template size or bind assets
  if (newProps.usesTemplate) {
    CASSize *adSize = [CASSize getInlineBannerWithWidth:newProps.width
                                              maxHeight:newProps.height];
    [self.nativeView setAdTemplateSize:adSize];
  } else {
    [RNCASNativeAdAssetBinder bindAssetsIfPossibleForNativeView:self.nativeView
                                                           placeholders:self.assetPlaceholders
                                                                  views:self.assetViews];
  }

  // 3. Update native ad only if changed
  if (self.appliedInstanceId != newProps.instanceId) {
    self.appliedInstanceId = newProps.instanceId;
    CASNativeAdContent *ad =
        [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.appliedInstanceId)];

    [self.nativeView setNativeAd:ad];
  }
  
  // Headline
  if (newProps.usesTemplate) {
    // 4. Apply styles
    if (newProps.backgroundColor) {
      self.nativeView.backgroundColor = RCTUIColorFromSharedColor(newProps.backgroundColor);
    }
    
    if (newProps.headlineTextColor && self.nativeView.headlineView) {
      self.nativeView.headlineView.textColor =
          RCTUIColorFromSharedColor(newProps.headlineTextColor);
    }

    // Secondary text: body, advertiser, store, price, reviewCount
    if (newProps.secondaryTextColor) {
      UIColor *color = RCTUIColorFromSharedColor(newProps.secondaryTextColor);
      if (self.nativeView.bodyView) {
        self.nativeView.bodyView.textColor = color;
      }
      if (self.nativeView.advertiserView) {
        self.nativeView.advertiserView.textColor = color;
      }
      if (self.nativeView.storeView) {
        self.nativeView.storeView.textColor = color;
      }
      if (self.nativeView.priceView) {
        self.nativeView.priceView.textColor = color;
      }
      if (self.nativeView.reviewCountView) {
        self.nativeView.reviewCountView.textColor = color;
      }
    }

    // Primary text: call to action (CTA)
    UIButton *button = self.nativeView.callToActionView;
    if (button) {
      UIColor *primaryColor = RCTUIColorFromSharedColor(newProps.primaryColor);
      UIColor *callToActionTextColor = RCTUIColorFromSharedColor(newProps.primaryTextColor);
      if (@available(iOS 15.0, *)) {
        UIButtonConfiguration *config = button.configuration;
        if (config) {
          if (primaryColor != nil) {
            config.baseBackgroundColor = primaryColor;
          }
          if (callToActionTextColor != nil) {
            config.baseForegroundColor = callToActionTextColor;
          }

          button.configuration = config;
          [button setNeedsUpdateConfiguration];
        }
      } else {
        if (primaryColor != nil) {
          button.backgroundColor = primaryColor;
        }
        if (callToActionTextColor != nil) {
          [button setTitleColor:callToActionTextColor forState:UIControlStateNormal];
        }
      }
    }

    // Fonts // bold | italic | monospace | medium etc
    // Convert std::string to NSString*

    // HEADLINE

    NSString *headlineFontStyle = RCTNSStringFromString(newProps.headlineFontStyle);

    if (headlineFontStyle && self.nativeView.headlineView) {
      self.nativeView.headlineView.font =
        RNCASFontForStyle(headlineFontStyle,
                          self.nativeView.headlineView);
    }

    NSString *secondaryFontStyle = RCTNSStringFromString(newProps.secondaryFontStyle);

    if (secondaryFontStyle) {
      if (self.nativeView.bodyView) {
        self.nativeView.bodyView.font =
            RNCASFontForStyle(secondaryFontStyle, self.nativeView.bodyView);
      }
      if (self.nativeView.storeView) {
        self.nativeView.storeView.font =
            RNCASFontForStyle(secondaryFontStyle, self.nativeView.storeView);
      }
      if (self.nativeView.priceView) {
        self.nativeView.priceView.font =
            RNCASFontForStyle(secondaryFontStyle, self.nativeView.priceView);
      }
      if (self.nativeView.advertiserView) {
        self.nativeView.advertiserView.font =
            RNCASFontForStyle(secondaryFontStyle, self.nativeView.advertiserView);
      }
      if (self.nativeView.reviewCountView) {
        self.nativeView.reviewCountView.font =
            RNCASFontForStyle(secondaryFontStyle, self.nativeView.reviewCountView);
      }
    }
  }
 
  [super updateProps:props oldProps:oldProps];
}

#pragma mark - Mount/unmount child

- (void)mountChildComponentView:(UIView *)child index:(NSInteger)index {
  if ([RNCASNativeAdAssetBinder isAssetTag:child.tag]) {
    self.assetPlaceholders[@(child.tag)] = child;
    [RNCASNativeAdAssetBinder bindAssetsIfPossibleForNativeView:self.nativeView
                                                   placeholders:self.assetPlaceholders
                                                          views:self.assetViews];
    return;
  }
  [super mountChildComponentView:child index:index];
}

- (void)unmountChildComponentView:(UIView *)child index:(NSInteger)index {
  if ([RNCASNativeAdAssetBinder isAssetTag:child.tag]) {
    NSNumber *key = @(child.tag);
    UIView *assetView = self.assetViews[key];
    [assetView removeFromSuperview];
    [self.assetViews removeObjectForKey:key];
    [self.assetPlaceholders removeObjectForKey:key];
    [child removeFromSuperview];
    return;
  }
  [super unmountChildComponentView:child index:index];
}

#pragma mark - Recycle

- (void)prepareForRecycle {
  [self.assetViews enumerateKeysAndObjectsUsingBlock:^(NSNumber * _Nonnull key, UIView * _Nonnull obj, BOOL * _Nonnull stop) {
    [obj removeFromSuperview];
  }];
  [self.assetViews removeAllObjects];
  [self.assetPlaceholders removeAllObjects];
  
  [self.nativeView removeFromSuperview];
  self.nativeView = nil;
  self.appliedInstanceId = -1;
  
  [super prepareForRecycle];
}


@end


#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAdViewCls(void) {
  return RNCASNativeAdView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
