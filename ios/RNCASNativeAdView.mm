#ifdef RCT_NEW_ARCH_ENABLED
#import "RNCASNativeAdView.h"
#import "CASMobileAds.h"
#import "RNCASNativeAdStore.h"

#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import "RCTFabricComponentsPlugins.h"
#import <React/RCTBridge.h>
#import <React/RCTConversions.h>
#import <React/RCTUIManager.h>

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RCTBridge (Private)
+ (RCTBridge *)currentBridge;
@end

@interface RNCASNativeAdView () <RCTCASNativeAdViewViewProtocol>
@property(nonatomic, strong) CASNativeView *nativeView;
@property(nonatomic, strong) CASSize *lastTemplateSize;
@property(nonatomic, assign) NSInteger instanceId;
@property(nonatomic, assign) NSInteger appliedInstanceId;
@property (nonatomic, assign) BOOL usesTemplate;
@property(nonatomic, strong) dispatch_block_t debouncedApply;
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

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<const CASNativeAdViewProps>(props);
  
  // 1. Ensure CASNativeView
  if (!self.nativeView) {
    self.nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];
    self.nativeView.translatesAutoresizingMaskIntoConstraints = YES;
    [self addSubview:self.nativeView];
  }
  self.instanceId = newProps.instanceId;
  self.usesTemplate = newProps.usesTemplate;
  
  // Update template size or bind assets // setNativeAd via debounce
  if (newProps.usesTemplate) {
    // 2. Update template size
    CASSize *adSize = [CASSize getInlineBannerWithWidth:newProps.width maxHeight:newProps.height];
    if (adSize != self.lastTemplateSize) {
      [self.nativeView setAdTemplateSize:adSize];
      self.lastTemplateSize = adSize;
      // Reset applied ad to refresh ad content for new views
      self.appliedInstanceId = -1;
    }
  }
  
  // 4. Apply styles
  [self applyTemplateStyles:newProps];
  
  [super updateProps:props oldProps:oldProps];
  
  if (self.window) {
    [self applyNativeAd];
  }
}

- (void)didMoveToWindow {
  [super didMoveToWindow];
  [self debounceApplyNativeAd];
}

- (void)layoutSubviews {
  [super layoutSubviews];
  
  if (!self.usesTemplate) {
    self.nativeView.frame = self.bounds;
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
    if (!bridge)
      return;
    
    UIView *view = [bridge.uiManager viewForReactTag:@(reactTag)];
    [self registerAssetView:view assetType:assetType];
  });
}

#pragma mark - Native → Native (View assets)

- (void)registerAssetView:(UIView *)view assetType:(NSInteger)assetType {
  if (!view) return;
  
  if (assetType == 2) {
      if ([view isKindOfClass:[UIButton class]]) {
        self.nativeView.callToActionView = (UIButton *)view;
      }
      [self debounceApplyNativeAd];
      return;
    }

  
  if (![view isDescendantOfView:self.nativeView]) {
    UIView *fromSuperview = view.superview;
    if (!fromSuperview) return;
    
    CGRect frameInNativeView =
    [fromSuperview convertRect:view.frame toView:self.nativeView];
    
    [view removeFromSuperview];
    view.frame = frameInNativeView;
    view.autoresizingMask = UIViewAutoresizingNone;
    [self.nativeView addSubview:view];
  }
  
  switch (assetType) {
    case 0:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.headlineView = (UILabel *)view;
      }
      break;
    case 1:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.bodyView = (UILabel *)view;
      }
      break;
    case 2:      
      self.nativeView.callToActionView = (UIButton *)view;
      break;
    case 3:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.advertiserView = (UILabel *)view;
      }
      break;
    case 4:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.storeView = (UILabel *)view;
      }
      break;
    case 5:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.priceView = (UILabel *)view;
      }
      break;
    case 6:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.reviewCountView = (UILabel *)view;
      }
      break;
    case 7:
      self.nativeView.starRatingView = view;
      view.userInteractionEnabled = NO;
      break;
    case 8:
      if ([view isKindOfClass:[UILabel class]]) {
        self.nativeView.adLabelView = (UILabel *)view;
      }
      break;
    case 9:
      if ([view isKindOfClass:[UIImageView class]]) {
        self.nativeView.iconView = (UIImageView *)view;
      }
      break;
    case 10:
      if ([view isKindOfClass:[CASMediaView class]]) {
        self.nativeView.mediaView = (CASMediaView *)view;
      }
      break;
    case 11:
      if ([view isKindOfClass:[CASChoicesView class]]) {
        self.nativeView.adChoicesView = (CASChoicesView *)view;
      }
      break;
    default:
      break;
  }
  
  NSLog(@"[NativeAd][Asset] type=%ld jsView=%@ frame=%@ window=%@",
        (long)assetType,
        NSStringFromClass(view.class),
        NSStringFromCGRect(view.frame),
        view.window);
  
  
  [self debounceApplyNativeAd];
}

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
    [strongSelf applyNativeAd];
  });
  
  self.debouncedApply = block;
  
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), block);
}

- (void)applyNativeAd {
  if (self.appliedInstanceId != self.instanceId) {
    self.appliedInstanceId = self.instanceId;
    CASNativeAdContent *ad =
    [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.appliedInstanceId)];
    
    if (ad) {
      [self.nativeView setNativeAd:ad];
      
      // FIXME: need to remove
      dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"[NativeAd][After setNativeAd]");
        
        NSLog(@"CTA view: %@ frame=%@ hidden=%d alpha=%.2f title=%@",
              self.nativeView.callToActionView,
              NSStringFromCGRect(self.nativeView.callToActionView.frame),
              self.nativeView.callToActionView.hidden,
              self.nativeView.callToActionView.alpha,
              self.nativeView.callToActionView.titleLabel.text);
        
        UIView *starContainer = self.nativeView.starRatingView;
        NSLog(@"Star container: %@ frame=%@ subviews=%lu",
              starContainer,
              NSStringFromCGRect(starContainer.frame),
              (unsigned long)starContainer.subviews.count);
        
        for (UIView *sub in starContainer.subviews) {
          NSLog(@" subview %@ frame=%@ hidden=%d alpha=%.2f",
                NSStringFromClass(sub.class),
                NSStringFromCGRect(sub.frame),
                sub.hidden,
                sub.alpha);
        }
      });
      
    } else {
      @throw [NSException exceptionWithName:NSInvalidArgumentException
                                     reason:@"Native ad content not found"
                                   userInfo:nil];
    }
  }
}

#pragma mark - Recycle

- (void)prepareForRecycle {
  if (self.debouncedApply) {
    dispatch_block_cancel(self.debouncedApply);
    self.debouncedApply = nil;
  }
  
  self.appliedInstanceId = -1;
  
  [super prepareForRecycle];
}

#pragma mark - Template styles

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

@end

#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAdViewCls(void) { return RNCASNativeAdView.class; }

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
