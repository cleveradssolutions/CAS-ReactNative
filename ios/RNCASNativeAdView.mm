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
    }
  
    return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<CASNativeAdViewProps const>(props);

  if (self.nativeView != nil) return;
  
  CASNativeAdContent *ad = [[RNCASNativeAdStore shared] findNativeAdWithId:@(newProps.instanceId)];
  
  if (!ad) return;
  
  self.nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];
  
  // Set size
  NSInteger width = static_cast<NSInteger>(newProps.width);
  NSInteger height = static_cast<NSInteger>(newProps.height);
  CASSize *adSize = RNCASResolveAdSize(width, height);
  [self.nativeView setAdTemplateSize:adSize];
  
  // Add view
  self.nativeView.translatesAutoresizingMaskIntoConstraints = YES;
  [self addSubview:_nativeView];
  
  // Set ad
  [self.nativeView setNativeAd:ad];
  
  // Set styles
  
  // Background
  if (newProps.backgroundColor) {
    self.nativeView.backgroundColor = RCTUIColorFromSharedColor(newProps.backgroundColor);
  }
  
  // Headline
  if (newProps.headlineTextColor && self.nativeView.headlineView) {
    self.nativeView.headlineView.textColor = RCTUIColorFromSharedColor(newProps.headlineTextColor);
  }
  
  // Secondary text: body, advertiser, store, price, reviewCount
  if (newProps.secondaryTextColor) {
    if (self.nativeView.bodyView) {
      self.nativeView.bodyView.textColor = RCTUIColorFromSharedColor(newProps.secondaryTextColor);
    }
    if (self.nativeView.advertiserView) {
      self.nativeView.advertiserView.textColor = RCTUIColorFromSharedColor(newProps.secondaryTextColor);
    }
    if (self.nativeView.storeView) {
      self.nativeView.storeView.textColor = RCTUIColorFromSharedColor(newProps.secondaryTextColor);
    }
    if (self.nativeView.priceView) {
      self.nativeView.priceView.textColor = RCTUIColorFromSharedColor(newProps.secondaryTextColor);
    }
    if (self.nativeView.reviewCountView) {
      self.nativeView.reviewCountView.textColor = RCTUIColorFromSharedColor(newProps.secondaryTextColor);
    }
  }
  
  // Primary text: call to action (CTA)
  if (newProps.primaryTextColor && self.nativeView.callToActionView) {
    [self.nativeView.callToActionView setTitleColor: RCTUIColorFromSharedColor(newProps.primaryTextColor) forState:UIControlStateNormal];
  }
  
  // Primary background — CTA background color
  if (newProps.primaryColor && self.nativeView.callToActionView && self.nativeView.callToActionView) {
    UIButtonConfiguration *config = self.nativeView.callToActionView.configuration;
    if (!config) {
      config = [UIButtonConfiguration filledButtonConfiguration];
    }
    config.baseBackgroundColor = RCTUIColorFromSharedColor(newProps.primaryColor);
    self.nativeView.callToActionView.configuration = config;
  }
  
  // Fonts // bold | italic | monospace | medium etc
  // Convert std::string to NSString*
  NSString *headlineFontStyle = newProps.headlineFontStyle.length() > 0
    ? [NSString stringWithUTF8String:newProps.headlineFontStyle.c_str()]
    : nil;

  NSString *secondaryFontStyle = newProps.secondaryFontStyle.length() > 0
    ? [NSString stringWithUTF8String:newProps.secondaryFontStyle.c_str()]
    : nil;

  // HEADLINE
  if (headlineFontStyle && self.nativeView.headlineView) {
      self.nativeView.headlineView.font =
          RNCASFontForStyle(headlineFontStyle, self.nativeView.headlineView.font.pointSize);
  }

  // SECONDARY
  if (secondaryFontStyle) {
      if (self.nativeView.bodyView) {
          self.nativeView.bodyView.font =
              RNCASFontForStyle(secondaryFontStyle, self.nativeView.bodyView.font.pointSize);
      }
      if (self.nativeView.storeView) {
          self.nativeView.storeView.font =
              RNCASFontForStyle(secondaryFontStyle, self.nativeView.storeView.font.pointSize);
      }
      if (self.nativeView.priceView) {
          self.nativeView.priceView.font =
              RNCASFontForStyle(secondaryFontStyle, self.nativeView.priceView.font.pointSize);
      }
      if (self.nativeView.advertiserView) {
          self.nativeView.advertiserView.font =
              RNCASFontForStyle(secondaryFontStyle, self.nativeView.advertiserView.font.pointSize);
      }
      if (self.nativeView.reviewCountView) {
          self.nativeView.reviewCountView.font =
              RNCASFontForStyle(secondaryFontStyle, self.nativeView.reviewCountView.font.pointSize);
      }
  }
    
  // Update Props
  [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle {
    [self.nativeView removeFromSuperview];
    self.nativeView = nil;

    [super prepareForRecycle];
}

@end


#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAdViewCls(void) {
    return RNCASNativeAdView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
