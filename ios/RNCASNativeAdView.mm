#import "UIKit/UIKit.h"
#import "RNCASNativeAdView.h"
#import "RNCASNativeAdHolder.h"
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

@implementation RNCASNativeAdView

- (void)didMoveToWindow {
  [super didMoveToWindow];
}

- (void)layoutSubviews {
  [super layoutSubviews];
  [self loadAdIntoView];
}

- (void)loadAdIntoView {
  CASNativeAdContent *ad = [[RNCASNativeAdHolder shared] getAd];
  if (!ad) return;
  
  CASNativeView *nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];
  
  // Set size
  CASSize *adSize = [self resolveAdSize];
  [nativeView setAdTemplateSize:adSize];
  
  [self addSubview:nativeView];
  nativeView.translatesAutoresizingMaskIntoConstraints = NO;
  
  [NSLayoutConstraint activateConstraints:@[
    [nativeView.topAnchor constraintEqualToAnchor:self.topAnchor],
    [nativeView.bottomAnchor constraintEqualToAnchor:self.bottomAnchor],
    [nativeView.leadingAnchor constraintEqualToAnchor:self.leadingAnchor],
    [nativeView.trailingAnchor constraintEqualToAnchor:self.trailingAnchor]
  ]];
  
  // Set ad
  [nativeView setNativeAd:ad];
  
  [self applyTemplateStyle:self.templateStyle to:nativeView];
}

- (CASSize *)resolveAdSize {
  CGFloat w = self.width ? self.width.floatValue : 0;
  CGFloat h = self.height ? self.height.floatValue : 0;
  
  // 1: width + height
  if (w > 0 && h > 0) {
    return [CASSize getInlineBannerWithWidth:w maxHeight:h];
  }
  
  // 2: width
  if (w > 0) {
    // Adaptive minimal 300
    if (w < 300) w = 300;
    return [CASSize getAdaptiveBannerForMaxWidth:w];
  }
  
  // 3: (no width, no height)
  return CASSize.mediumRectangle;
}

- (void)applyTemplateStyle:(NSDictionary *)style to:(CASNativeView *)nativeView {
  if (!style) return;
  
  // Colors
  UIColor *backgroundColor = [self colorFromHexString: style[@"backgroundColor"]];
  UIColor *primaryColor = [self colorFromHexString: style[@"primaryColor"]];
  UIColor *primaryTextColor = [self colorFromHexString: style[@"primaryTextColor"]];
  UIColor *headlineTextColor = [self colorFromHexString: style[@"headlineTextColor"]];
  UIColor *secondaryTextColor = [self colorFromHexString: style[@"secondaryTextColor"]];
  
  if (backgroundColor) {
    nativeView.backgroundColor = backgroundColor;
  }
  
  // Headline
  if (headlineTextColor && nativeView.headlineView) {
    nativeView.headlineView.textColor = headlineTextColor;
  }
  
  // Secondary text: body, advertiser, store, price, reviewCount
  if (secondaryTextColor) {
    if (nativeView.bodyView) nativeView.bodyView.textColor = secondaryTextColor;
    if (nativeView.advertiserView) nativeView.advertiserView.textColor = secondaryTextColor;
    if (nativeView.storeView) nativeView.storeView.textColor = secondaryTextColor;
    if (nativeView.priceView) nativeView.priceView.textColor = secondaryTextColor;
    if (nativeView.reviewCountView) nativeView.reviewCountView.textColor = secondaryTextColor;
  }
  
  // Primary text: call to action (CTA)
  if (primaryTextColor && nativeView.callToActionView) {
    [nativeView.callToActionView setTitleColor:primaryTextColor forState:UIControlStateNormal];
  }
  
  // Primary background — CTA background color
  if (primaryColor && nativeView.callToActionView && nativeView.callToActionView) {
    UIButtonConfiguration *config = nativeView.callToActionView.configuration;
    if (!config) {
      config = [UIButtonConfiguration filledButtonConfiguration];
    }
    config.baseBackgroundColor = primaryColor;
    nativeView.callToActionView.configuration = config;
  }
  
  // Fonts
  NSString *headlineFontStyle = style[@"headlineFontStyle"]; // bold | italic | monospace | medium etc
  NSString *secondaryFontStyle = style[@"secondaryFontStyle"];
  
  if (headlineFontStyle && nativeView.headlineView) {
    nativeView.headlineView.font = [self fontForStyle:headlineFontStyle baseSize:nativeView.headlineView.font.pointSize];
  }
  
  if (secondaryFontStyle) {
    if (nativeView.bodyView) nativeView.bodyView.font = [self fontForStyle:secondaryFontStyle baseSize:nativeView.bodyView.font.pointSize];
    if (nativeView.storeView) nativeView.storeView.font = [self fontForStyle:secondaryFontStyle baseSize:nativeView.storeView.font.pointSize];
    if (nativeView.priceView) nativeView.priceView.font = [self fontForStyle:secondaryFontStyle baseSize:nativeView.priceView.font.pointSize];;
    if (nativeView.advertiserView) nativeView.advertiserView.font = [self fontForStyle:secondaryFontStyle baseSize:nativeView.advertiserView.font.pointSize];;
    if (nativeView.reviewCountView) nativeView.reviewCountView.font =  [self fontForStyle:secondaryFontStyle baseSize:nativeView.reviewCountView.font.pointSize];;
  }
}


- (UIColor *)colorFromHexString:(NSString *)hex {
  unsigned rgbValue = 0;
  NSScanner *scanner = [NSScanner scannerWithString:hex];
  
  if ([hex hasPrefix:@"#"]) {
    scanner.scanLocation = 1;
  }
  
  [scanner scanHexInt:&rgbValue];
  
  return [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16)/255.0f
                         green:((rgbValue & 0x00FF00) >> 8)/255.0f
                          blue:(rgbValue & 0x0000FF)/255.0f
                         alpha:1.0];
}


- (UIFont *)fontForStyle:(NSString *)style baseSize:(CGFloat)size {
  if (!style) return [UIFont systemFontOfSize:size];
  
  NSString *s = style.lowercaseString;
  
  if ([s isEqualToString:@"bold"]) {
    return [UIFont boldSystemFontOfSize:size];
  }
  if ([s isEqualToString:@"italic"]) {
    return [UIFont italicSystemFontOfSize:size];
  }
  if ([s isEqualToString:@"medium"]) {
    return [UIFont systemFontOfSize:size weight:UIFontWeightMedium];
  }
  if ([s isEqualToString:@"monospace"]) {
    return [UIFont monospacedSystemFontOfSize:size weight:UIFontWeightRegular];
  }
  
  return [UIFont systemFontOfSize:size];
}

@end
