#import "CASMobileAds.h"
#import "RNCASNativeAdView.h"
#import "RNCASNativeAdStore.h"
#import "RNCASStarRatingContainer.h"

#import "RCTFabricComponentsPlugins.h"

#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTConversions.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>


#ifdef RCT_NEW_ARCH_ENABLED
using namespace facebook::react;
#endif

@interface RCTBridge (Private)
+ (RCTBridge *)currentBridge;
@end

@interface RNCASNativeAdView ()

#ifdef RCT_NEW_ARCH_ENABLED
<RCTCASNativeAdViewViewProtocol>

@property(nonatomic, assign) NSInteger instanceId;
@property(nonatomic, assign) BOOL usesTemplate;
#endif

@property(nonatomic, strong) CASNativeView *nativeView;
@property(nonatomic, strong) CASSize *lastTemplateSize;
@property(nonatomic, assign) int appliedInstanceId;
@property(nonatomic, strong) dispatch_block_t debouncedApply;

@end

@implementation RNCASNativeAdView

#pragma mark - Init

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
    #ifdef RCT_NEW_ARCH_ENABLED
    static const auto defaultProps = std::make_shared<const CASNativeAdViewProps>();
    _props = defaultProps;
    #endif
    _appliedInstanceId = -1;
    
    _nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];
    _nativeView.translatesAutoresizingMaskIntoConstraints = YES;
    _nativeView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    [self addSubview: _nativeView];
  }
  
  return self;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (UIView *)contentView {
  if (self.usesTemplate) {
    return nil;
  }
  return self.nativeView;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CASNativeAdViewComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

#else

#pragma mark - Dealloc

- (void)dealloc {
  self.nativeView = nil;
  if (_debouncedApply) {
    dispatch_block_cancel(_debouncedApply);
    _debouncedApply = nil;
  }
}

#endif

#pragma mark - Props (Fabric)

#ifdef RCT_NEW_ARCH_ENABLED
- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<const CASNativeAdViewProps>(props);
  
  // 1. Update properties
  self.instanceId = newProps.instanceId;
  self.usesTemplate = newProps.usesTemplate;
  
  // 2. Update template size
  [self updateTemplateSizeWithWidth:newProps.width height:newProps.height];
  
  // 3. Apply Ad
  if (newProps.usesTemplate) {
    [self applyNativeAdIfNeeded];
  } else if (self.window) {
    [self debounceApplyNativeAd];
  }
  
  // 4. Apply styles (Assets Mode)
  [self applyTemplateStyles:newProps];
  
  [super updateProps:props oldProps:oldProps];
}

#else
- (void)didSetProps:(NSArray<NSString *> *)changedProps {
  // 1. Update template size
  [self updateTemplateSizeWithWidth:self.width height:self.height];
       
  // 2. Apply Ad
  if (self.usesTemplate) {
    [self applyNativeAdIfNeeded];
  } else if (self.window) {
    [self debounceApplyNativeAd];
  }
  
  // 3. Apply styles (Template Mode)
  [self applyTemplateStyleToView:self.nativeView];
}
#endif

#ifdef RCT_NEW_ARCH_ENABLED

#pragma mark - Mount / Unmount

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)child index:(NSInteger)index {
  [_nativeView insertSubview:child atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)child index:(NSInteger)index {
  [child removeFromSuperview];
}

#pragma mark - Window

- (void)didMoveToWindow {
  [super didMoveToWindow];
  if (!self.usesTemplate) {
    [self debounceApplyNativeAd];
  }
}

#endif

#pragma mark - Layout

- (void)layoutSubviews {
  [super layoutSubviews];
  _nativeView.frame = self.bounds;
}

#pragma mark - Template size

- (void)updateTemplateSizeWithWidth:(CGFloat)width height:(CGFloat)height {
  if (!_usesTemplate) return;

  CASSize *size;
  if (width <= 0 || height <= 0) {
    size = [CASSize mediumRectangle];
  } else {
    size = [CASSize getInlineBannerWithWidth:width maxHeight:height];
  }

  if (size != _lastTemplateSize) {
    [_nativeView setAdTemplateSize:size];
    _lastTemplateSize = size;
    _appliedInstanceId = -1;
  }
}

#pragma mark - Commands (JS → Native)

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
  if ([commandName isEqualToString:@"registerAsset"]) {
    NSInteger assetType = [args[0] integerValue];
    NSInteger reactTag = [args[1] integerValue];
    [self registerAsset:assetType reactTag:reactTag];
    
    return;
  }
}

#pragma mark - JS → Native (Text assets)

- (void)registerAsset:(NSInteger)assetType reactTag:(NSInteger)reactTag {
  RCTExecuteOnMainQueue(^{
    RCTBridge *bridge = [RCTBridge currentBridge];
    if (!bridge) return;

    UIView *anchorView = [bridge.uiManager viewForReactTag:@(reactTag)];
    if (!anchorView) return;
    
    // React Native <Text> components are not backed by UILabel in the New Architecture
    // (they are rendered as RCTParagraphComponentView).
    //
    // Native ad SDKs, however, require text assets to be registered via UILabel instances
    // in order to correctly track impressions, clicks, and asset visibility.
    //
    // For this reason we create an invisible UILabel that matches the asset view bounds
    // and register it with the SDK. The actual text rendering is fully handled by React Native.
    UILabel *label = [[UILabel alloc] initWithFrame:anchorView.bounds];
    label.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

    label.backgroundColor = UIColor.clearColor;
    label.text = @"";
    label.textColor = UIColor.clearColor;
    label.userInteractionEnabled = YES;

    [anchorView addSubview:label];
    
    switch (assetType) {
      case 0: self.nativeView.headlineView    = label; break;
      case 1: self.nativeView.bodyView        = label; break;
      case 3: self.nativeView.advertiserView  = label; break;
      case 4: self.nativeView.storeView       = label; break;
      case 5: self.nativeView.priceView       = label; break;
      case 6: self.nativeView.reviewCountView = label; break;
      case 8: self.nativeView.adLabelView     = label; break;
      default:
        return;
    }
    
    [self debounceApplyNativeAd];
  });
}


#pragma mark - Native → Native (View assets)

- (void)registerAssetView:(UIView *)view assetType:(NSInteger)assetType {
  if (!view) return;
  
  switch (assetType) {
    case 2: // CALL TO ACTION
      self.nativeView.callToActionView = (UIButton *)view;
      break;
      
    case 7: // STAR RATING
      self.nativeView.starRatingView = view;
      view.userInteractionEnabled = NO;
      break;
      
    case 9: // ICON
      self.nativeView.iconView = (UIImageView *)view;
      break;
      
    case 10: // MEDIA
      self.nativeView.mediaView = (CASMediaView *)view;
      break;
      
    case 11: // AD CHOICES
      self.nativeView.adChoicesView = (CASChoicesView *)view;
      break;
      
    default:
      return;
  }
  
  [self debounceApplyNativeAd];
}


#pragma mark - Apply Native Ad

- (void)debounceApplyNativeAd {
  if (self.debouncedApply != nil) {
    dispatch_block_cancel(self.debouncedApply);
    self.debouncedApply = nil;
  }
  
  __weak __typeof__(self) weakSelf = self;
  
  dispatch_block_t block = dispatch_block_create(DISPATCH_BLOCK_NO_QOS_CLASS, ^{
    __strong __typeof__(weakSelf) strongSelf = weakSelf;
    if (!strongSelf)
      return;
    [strongSelf applyNativeAdIfNeeded];
  });
  
  self.debouncedApply = block;
  
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), block);
}

- (void)applyNativeAdIfNeeded {
  //if (!self.window) return;
  if (self.appliedInstanceId == self.instanceId) return;
  
  self.appliedInstanceId = self.instanceId;
  CASNativeAdContent *ad =
  [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.appliedInstanceId)];
  
  if (ad) {
    [self.nativeView setNativeAd:ad];
  } else {
    @throw [NSException exceptionWithName:NSInvalidArgumentException
                                   reason:@"Native ad content not found"
                                 userInfo:nil];
  }
}

#pragma mark - Styles

#ifdef RCT_NEW_ARCH_ENABLED
- (void)applyTemplateStyles:(const CASNativeAdViewProps &)props {
  if (props.backgroundColor) {
    self.nativeView.backgroundColor = RCTUIColorFromSharedColor(props.backgroundColor);
  }
  
  if (props.headlineTextColor && self.nativeView.headlineView) {
    self.nativeView.headlineView.textColor = RCTUIColorFromSharedColor(props.headlineTextColor);
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
    RNCASFontForStyle(headlineFontStyle, self.nativeView.headlineView);
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
#else
- (void)applyTemplateStyleToView:(CASNativeView *)nativeView {
  if (self.backgroundColor) {
    nativeView.backgroundColor = self.backgroundColor;
  }
  
  // Fonts // bold | italic | monospace | medium etc
  NSString *headlineFontStyle = self.headlineFontStyle;
  NSString *secondaryFontStyle = self.secondaryFontStyle;
  
  // Headline
  if (self.headlineTextColor && nativeView.headlineView) {
    nativeView.headlineView.textColor = self.headlineTextColor;
  }
  
  // Secondary text: body, advertiser, store, price, reviewCount
  if (self.secondaryTextColor) {
    if (nativeView.bodyView) nativeView.bodyView.textColor = self.secondaryTextColor;
    if (nativeView.advertiserView) nativeView.advertiserView.textColor = self.secondaryTextColor;
    if (nativeView.storeView) nativeView.storeView.textColor = self.secondaryTextColor;
    if (nativeView.priceView) nativeView.priceView.textColor = self.secondaryTextColor;
    if (nativeView.reviewCountView) nativeView.reviewCountView.textColor = self.secondaryTextColor;
  }
  
  // Primary text: call to action (CTA)
  UIButton *button = self.nativeView.callToActionView;
  if (button) {
    if (@available(iOS 15.0, *)) {
      UIButtonConfiguration *config = button.configuration;
      if (config) {
        if (self.primaryColor != nil) {
          config.baseBackgroundColor = self.primaryColor;
        }
        if (self.primaryTextColor != nil) {
          config.baseForegroundColor = self.primaryTextColor;
        }
        
        button.configuration = config;
        [button setNeedsUpdateConfiguration];
      }
    } else {
      if (self.primaryColor != nil) {
        button.backgroundColor = self.primaryColor;
      }
      if (self.primaryTextColor != nil) {
        [button setTitleColor:self.primaryTextColor forState:UIControlStateNormal];
      }
    }
  }
  
  if (headlineFontStyle && nativeView.headlineView) {
    nativeView.headlineView.font = RNCASFontForStyle(headlineFontStyle, nativeView.headlineView);
  }
  
  if (secondaryFontStyle) {
    if (nativeView.bodyView) {
      nativeView.bodyView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.bodyView);
    }
    if (nativeView.storeView) {
      nativeView.storeView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.storeView);
    }
    if (nativeView.priceView) {
      nativeView.priceView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.priceView);
    }
    if (nativeView.advertiserView) {
      nativeView.advertiserView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.advertiserView);
    }
    if (nativeView.reviewCountView) {
      nativeView.reviewCountView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.reviewCountView);
    }
  }
}
#endif

@end

#ifdef RCT_NEW_ARCH_ENABLED

#pragma mark - Fabric registration

Class<RCTComponentViewProtocol> RNCASNativeAdViewCls(void) { return RNCASNativeAdView.class; }

#else

#pragma mark - Paper View Manager
@implementation RNCASNativeAdViewManager

RCT_EXPORT_MODULE(CASNativeAdView)

// Export props
RCT_EXPORT_VIEW_PROPERTY(instanceId, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(width, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(height, CGFloat)

// Templates
RCT_EXPORT_VIEW_PROPERTY(usesTemplate, BOOL)

// Export types
RCT_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(primaryColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(primaryTextColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(headlineTextColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(headlineFontStyle, NSString)
RCT_EXPORT_VIEW_PROPERTY(secondaryTextColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(secondaryFontStyle, NSString)

- (UIView *)view {
  RNCASNativeAdView *view = [RNCASNativeAdView new];
  return view;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

// Commands
RCT_EXPORT_METHOD(registerAsset
                  : (nonnull NSNumber *)reactTag
                  assetType
                  : (nonnull NSNumber *)assetType
                  assetReactTag
                  : (nonnull NSNumber *)assetReactTag)
{
  [self.bridge.uiManager addUIBlock:^(
    __unused RCTUIManager *uiManager,
    NSDictionary<NSNumber *, UIView *> *viewRegistry
  ) {
    UIView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[RNCASNativeAdView class]]) {
      RCTLogError(@"Cannot find RNCASNativeAdViewComponent with tag: %@", reactTag);
      return;
    }

    UIView *assetView = viewRegistry[assetReactTag];
    if (!assetView) {
      RCTLogError(@"Cannot find asset view with tag: %@", assetReactTag);
      return;
    }

    [(RNCASNativeAdView *)view registerAssetView:assetView assetType:assetType.integerValue];
  }];
}

@end

#endif
