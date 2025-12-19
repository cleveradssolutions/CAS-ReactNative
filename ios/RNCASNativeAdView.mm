#ifdef RCT_NEW_ARCH_ENABLED
#import "CASMobileAds.h"
#import "RNCASNativeAdView.h"
#import "RNCASNativeAdStore.h"
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
    [self bindAssetsIfPossible];
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


- (BOOL)isAssetTag:(NSInteger)tag {
  return tag >= 101 && tag <= 112;
}

- (void)mountChildComponentView:(UIView *)child
                          index:(NSInteger)index {

  if ([self isAssetTag:child.tag]) {
    self.assetPlaceholders[@(child.tag)] = child;
    [self bindAssetsIfPossible];
    
    return;
  }

  [super mountChildComponentView:child index:index];
}

- (void)unmountChildComponentView:(UIView *)child
                            index:(NSInteger)index {

  if ([self isAssetTag:child.tag]) {
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



#pragma mark - Asset binding

- (void)bindAssetsIfPossible {
  if (!self.nativeView) return;

  for (NSNumber *key in self.assetPlaceholders) {
    UIView *placeholder = self.assetPlaceholders[key];

    if (placeholder.superview != self.nativeView) {
      [self.nativeView addSubview:placeholder];
    }

    UIView *assetView = self.assetViews[key];
    if (!assetView) {
      assetView = [self createSDKAssetView:key.integerValue];
      if (!assetView) continue;

      assetView.frame = placeholder.bounds;
      assetView.autoresizingMask =
        UIViewAutoresizingFlexibleWidth |
        UIViewAutoresizingFlexibleHeight;

      [placeholder addSubview:assetView];
      self.assetViews[key] = assetView;
      
      [self registerAssetView:assetView forTag:key.integerValue];
    }

    assetView.frame = placeholder.bounds;
  }
}

- (UIView *)createSDKAssetView:(NSInteger)tag {
  switch(tag) {
    case 101: return [[UILabel alloc] init]; // HEADLINE
    case 102: return [[CASMediaView alloc] init]; // MEDIA
    case 103: return [[UIButton alloc] init]; // CALL_TO_ACTION
    case 104: return [[UIImageView alloc] init]; // ICON
    case 105: return [[UILabel alloc] init]; // BODY
    case 106: return [[UILabel alloc] init]; // PRICE
    case 107: return [[UILabel alloc] init]; // ADVERTISER
    case 108: return [[UILabel alloc] init]; // STORE
    case 109: return [[UIView alloc] init]; // STAR RATING
    case 110: return [[UILabel alloc] init]; // REVIEW COUNT
    case 111: return [[UILabel alloc] init]; // AD LABEL
    case 112: return [[CASChoicesView alloc] init]; // ADCHOICES
    default: return nil;
  }
}

- (void)registerAssetView:(UIView *)view forTag:(NSInteger)tag {
  switch(tag) {
    case 101: self.nativeView.headlineView = (UILabel *)view; break;
    case 102: self.nativeView.mediaView = (CASMediaView *)view; break;
    case 103: self.nativeView.callToActionView = (UIButton *)view; break;
    case 104: self.nativeView.iconView = (UIImageView *)view; break;
    case 105: self.nativeView.bodyView = (UILabel *)view; break;
    case 106: self.nativeView.priceView = (UILabel *)view; break;
    case 107: self.nativeView.advertiserView = (UILabel *)view; break;
    case 108: self.nativeView.storeView = (UILabel *)view; break;
    case 109: self.nativeView.starRatingView = view; break;
    case 110: self.nativeView.reviewCountView = (UILabel *)view; break;
    case 111: self.nativeView.adLabelView = (UILabel *)view; break;
    case 112: self.nativeView.adChoicesView = (CASChoicesView *)view; break;
  }
}

- (void)prepareForRecycle {
  [self.nativeView removeFromSuperview];
  [self.assetPlaceholders removeAllObjects];
  [self.assetViews removeAllObjects];

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
