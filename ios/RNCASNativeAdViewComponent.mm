#import <UIKit/UIKit.h>
#import <React/RCTConversions.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import "CASMobileAds.h"
#import "RNCASNativeAdStore.h"
#import "RNCASNativeAdViewComponent.h"


@interface RNCASNativeAdViewComponent () 
@property (nonatomic, strong, nullable) CASNativeView *nativeView;
@property (nonatomic, assign) int appliedInstanceId;
@end

@implementation RNCASNativeAdViewComponent

- (void)dealloc {
  if (self.nativeView) {
    self.nativeView = nil;
  }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {

  // Create Native View if nedded
  if (!self.nativeView) {
    self.nativeView = [[CASNativeView alloc] initWithFrame:CGRectZero];

    self.nativeView.translatesAutoresizingMaskIntoConstraints = YES;
    [self addSubview:_nativeView];
  }

  // Refresh template Size
  // setAdTemplateSize can be called multiple times for same ad size with zero performance
  // drop
  CASSize *adSize = [CASSize getInlineBannerWithWidth:self.width maxHeight:self.height];
  [self.nativeView setAdTemplateSize:adSize];

  // Refresh Native Ad if changed only
  if (self.appliedInstanceId != self.instanceId) {
    self.appliedInstanceId = self.instanceId;
    CASNativeAdContent *ad =
        [[RNCASNativeAdStore shared] findNativeAdWithId:@(self.instanceId)];

    [self.nativeView setNativeAd:ad];
  }

  // Set styles
  [self applyTemplateStyleToView:self.nativeView];
}

- (void)applyTemplateStyleToView:(CASNativeView *)nativeView {
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

  // Fonts // bold | italic | monospace | medium etc
  NSString *headlineFontStyle = self.headlineFontStyle;
  NSString *secondaryFontStyle = self.secondaryFontStyle;
  
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

@end
