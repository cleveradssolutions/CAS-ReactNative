#import "RNCASNativeAdView.h"
#import "RNCASNativeAssetViewComponent.h"

@interface RNCASNativeAssetViewComponent ()
@property (nonatomic, assign) BOOL didRegister;
@end

@implementation RNCASNativeAssetViewComponent

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
  }
  return self;
}

- (void)setAssetType:(NSInteger)assetType {
  _assetType = assetType;
}

- (void)didMoveToSuperview {
  [super didMoveToSuperview];
  
  if (!self.superview || self.didRegister) {
    return;
  }
  
  self.didRegister = YES;
  
  UIView *parent = self.superview;
  while (parent) {
    if ([parent isKindOfClass:[RNCASNativeAdView class]]) {
      [(RNCASNativeAdView *)parent
       registerAssetView:self
       assetType:self.assetType];
      break;
    }
    parent = parent.superview;
  }
}

@end
