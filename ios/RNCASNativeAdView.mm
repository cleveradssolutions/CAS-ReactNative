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
    }
  
    return self;
}

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<CASNativeAdViewProps const>(props);

  // Create Native View if nedded
  if (!self.nativeView) {
    self.nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];

    self.nativeView.translatesAutoresizingMaskIntoConstraints = YES;
    [self addSubview:_nativeView];
  }

  // Refresh template Size
  // setAdTemplateSize can be called multiple times for same ad size with zero performance
  // drop
  CASSize *adSize = [CASSize getInlineBannerWithWidth:newProps.width
                                            maxHeight:newProps.height];
  [self.nativeView setAdTemplateSize:adSize];

  // Refresh Native Ad if changed only
  if (self.appliedInstanceId != newProps.instanceId) {
    self.appliedInstanceId = newProps.instanceId;
    CASNativeAdContent *ad =
        [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.appliedInstanceId)];

    [self.nativeView setNativeAd:ad];
  }

  // Set styles

  // Background
  if (newProps.backgroundColor) {
    self.nativeView.backgroundColor = RCTUIColorFromSharedColor(newProps.backgroundColor);
  }

  // Headline
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
        RNCASFontForStyle(headlineFontStyle, self.nativeView.headlineView);
  }

  // SECONDARY
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

  // Update Props
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle {
    [self.nativeView removeFromSuperview];
    self.appliedInstanceId = -1;

    [super prepareForRecycle];
}

@end


#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAdViewCls(void) {
    return RNCASNativeAdView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
