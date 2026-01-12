#import "RNCASNativeAdView.h"
#import "RNCASNativeAssetViewComponent.h"

@implementation RNCASNativeAssetViewComponent

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
  }
  return self;
}

- (void)setAssetType:(NSInteger)assetType {
  _assetType = assetType;
  
  if (assetType != 0 && self.tag != assetType) {
    self.tag = assetType;
  }
}

- (void)didMoveToSuperview {
  [super didMoveToSuperview];
  
  if (!self.superview) {
    return;
  }
  
  UIView *parent = self.superview;
  while (parent) {
    if ([parent isKindOfClass:[RNCASNativeAdView class]]) {
      [(RNCASNativeAdView *)parent
       registerAssetView:self
       assetType:self.tag];
      break;
    }
    parent = parent.superview;
  }
}


@end
