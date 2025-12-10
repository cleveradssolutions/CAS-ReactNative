#import <UIKit/UIKit.h>
#import <React/RCTConversions.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import "CASMobileAds.h"
#import "RNCASNativeAdStore.h"
#import "RNCASNativeAdViewComponent.h"


@interface RNCASNativeAdViewComponent ()
@property (nonatomic, strong, nullable) CASNativeView *nativeView;
@end

@implementation RNCASNativeAdViewComponent

- (void)dealloc {
  if (self.nativeView) {
    self.nativeView = nil;
  }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
        
  if (self.nativeView != nil) return;
  
  CASNativeAdContent *ad = [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.instanceId)];

  if (!ad) return;
  
  self.nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];
  
  // Set size
  CASSize *adSize = RNCASResolveAdSize(self.width, self.height);
  [self.nativeView setAdTemplateSize:adSize];
  
  // Add view
  self.nativeView.translatesAutoresizingMaskIntoConstraints = YES;
  [self addSubview:self.nativeView];

  // Set ad
  [self.nativeView setNativeAd:ad];
  
  // Set styles
  [self applyTemplateStyle:self.nativeView];
}

- (void)applyTemplateStyle:(CASNativeView *)nativeView {
  if (self.backgroundColor) {
    nativeView.backgroundColor = self.backgroundColor;
  }
  
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
  if (self.primaryTextColor && nativeView.callToActionView) {
    [nativeView.callToActionView setTitleColor: self.primaryTextColor forState:UIControlStateNormal];
  }
  
  // Primary background — CTA background color
  if (self.primaryColor && nativeView.callToActionView && nativeView.callToActionView) {
    UIButtonConfiguration *config = nativeView.callToActionView.configuration;
    if (!config) {
      config = [UIButtonConfiguration filledButtonConfiguration];
    }
    config.baseBackgroundColor = self.primaryColor;
    nativeView.callToActionView.configuration = config;
  }
  
  // Fonts // bold | italic | monospace | medium etc
  NSString *headlineFontStyle = self.headlineFontStyle;
  NSString *secondaryFontStyle = self.secondaryFontStyle;
  
  if (headlineFontStyle && nativeView.headlineView) {
    nativeView.headlineView.font = RNCASFontForStyle(headlineFontStyle, nativeView.headlineView.font.pointSize);
  }
  
  if (secondaryFontStyle) {
    if (nativeView.bodyView) {
      nativeView.bodyView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.bodyView.font.pointSize);
    }
    if (nativeView.storeView) {
      nativeView.storeView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.storeView.font.pointSize);
    }
    if (nativeView.priceView) {
      nativeView.priceView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.priceView.font.pointSize);
    }
    if (nativeView.advertiserView) {
      nativeView.advertiserView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.advertiserView.font.pointSize);
    }
    if (nativeView.reviewCountView) {
      nativeView.reviewCountView.font = RNCASFontForStyle(secondaryFontStyle, nativeView.reviewCountView.font.pointSize);
    }
  }
}

@end
