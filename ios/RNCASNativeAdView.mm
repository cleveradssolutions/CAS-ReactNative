#ifdef RCT_NEW_ARCH_ENABLED
#import "CASMobileAds.h"
#import "RNCASNativeAdView.h"
#import "RNCASNativeAdStore.h"

#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTConversions.h>
#import "RCTFabricComponentsPlugins.h"

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RCTBridge (Private)
+ (RCTBridge *)currentBridge;
@end

@interface RNCASNativeAdView () <RCTCASNativeAdViewViewProtocol>
@property (nonatomic, strong) CASNativeView *nativeView;
@property (nonatomic, assign) NSInteger appliedInstanceId;
@property (nonatomic, strong) dispatch_block_t debouncedApply;
@end

@implementation RNCASNativeAdView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CASNativeAdViewComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled {
  return NO;
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
    
  }
  
  return self;
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
    // Register Assets via RNCASNativeAdAssetRegistrar
  }
  
  // 3. Update native ad only if changed
  if (self.appliedInstanceId != newProps.instanceId) {
    self.appliedInstanceId = newProps.instanceId;
    CASNativeAdContent *ad =
    [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.appliedInstanceId)];
    
    [self.nativeView setNativeAd:ad];
  }
  
  // 4. Apply styles
  if (newProps.usesTemplate) {
    [self applyTemplateStyles:newProps];
  }
  
  [super updateProps:props oldProps:oldProps];
}

#pragma mark - JS → Native (Text assets)

- (void)registerAsset:(NSInteger)assetType reactTag:(NSInteger)reactTag {
  RCTExecuteOnMainQueue(^{
    RCTBridge *bridge = [RCTBridge currentBridge];
    if (!bridge) return;

    [bridge.uiManager addUIBlock:^(
      __unused RCTUIManager *uiManager,
      NSDictionary<NSNumber *, UIView *> *viewRegistry
    ) {
      UIView *view = viewRegistry[@(reactTag)];
      if (!view) return;

      view.userInteractionEnabled = NO;
      [self bindAssetView:view assetType:assetType];
      [self debounceApplyNativeAd];
    }];
  });
}

#pragma mark - Native → Native (View assets)

- (void)registerAssetView:(UIView *)view assetType:(NSInteger)assetType {
  if (!view) return;
  
  view.userInteractionEnabled = NO;
  [self bindAssetView:view assetType:assetType];
  [self debounceApplyNativeAd];
}

- (void)debounceApplyNativeAd {
  if (self.debouncedApply) {
    dispatch_block_cancel(self.debouncedApply);
    self.debouncedApply = nil;
  }
  
  dispatch_block_t block = ^{
    [self applyNativeAd];
  };
  
  self.debouncedApply = block;
  
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(),
                 block);
}


- (void)applyNativeAd {
  if (self.appliedInstanceId < 0) return;
  
  CASNativeAdContent *ad =
  [[RNCASNativeAdStore shared]
   findNativeAdWithId:@(self.appliedInstanceId)];
  
  if (ad) {
    self.nativeView.nativeAd = ad;
  }
}


#pragma mark - Recycle

- (void)prepareForRecycle {
  if (self.debouncedApply) {
    dispatch_block_cancel(self.debouncedApply);
    self.debouncedApply = nil;
  }
  
  self.nativeView.nativeAd = nil;
  self.appliedInstanceId = -1;
  
  [super prepareForRecycle];
}

#pragma mark - Asset binding

- (void)bindAssetView:(UIView *)view assetType:(NSInteger)assetType {
  switch (assetType) {
    case 0:  self.nativeView.headlineView = (UILabel *)view; break;
    case 1:  self.nativeView.bodyView = (UILabel *)view; break;
    case 2:  self.nativeView.callToActionView = (UIButton *)view; break;
    case 3:  self.nativeView.advertiserView = (UILabel *)view; break;
    case 4:  self.nativeView.storeView = (UILabel *)view; break;
    case 5:  self.nativeView.priceView = (UILabel *)view; break;
    case 6:  self.nativeView.reviewCountView = (UILabel *)view; break;
    case 7:  self.nativeView.starRatingView = view; break;
    case 8:  self.nativeView.adLabelView = (UILabel *)view; break;
    case 9:  self.nativeView.iconView = (UIImageView *)view; break;
    case 10: self.nativeView.mediaView = (CASMediaView *)view; break;
    case 11: self.nativeView.adChoicesView = (CASChoicesView *)view; break;
    default: break;
  }
}

#pragma mark - Template styles

- (void)applyTemplateStyles:(const CASNativeAdViewProps &)props {
  if (props.backgroundColor) {
    self.nativeView.backgroundColor = RCTUIColorFromSharedColor(props.backgroundColor);
  }
  
  if (props.headlineTextColor && self.nativeView.headlineView) {
    self.nativeView.headlineView.textColor =
    RCTUIColorFromSharedColor(props.headlineTextColor);
  }
  
  // Secondary text: body, advertiser, store, price, reviewCount
  if (props.secondaryTextColor) {
    UIColor *color = RCTUIColorFromSharedColor(props.secondaryTextColor);
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
    UIColor *primaryColor = RCTUIColorFromSharedColor(props.primaryColor);
    UIColor *callToActionTextColor = RCTUIColorFromSharedColor(props.primaryTextColor);
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
  NSString *headlineFontStyle = RCTNSStringFromString(props.headlineFontStyle);
  
  if (headlineFontStyle && self.nativeView.headlineView) {
    self.nativeView.headlineView.font =
    RNCASFontForStyle(headlineFontStyle,
                      self.nativeView.headlineView);
  }
  
  NSString *secondaryFontStyle = RCTNSStringFromString(props.secondaryFontStyle);
  
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

@end


#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAdViewCls(void) {
  return RNCASNativeAdView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
