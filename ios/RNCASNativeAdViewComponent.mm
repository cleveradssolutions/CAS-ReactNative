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
