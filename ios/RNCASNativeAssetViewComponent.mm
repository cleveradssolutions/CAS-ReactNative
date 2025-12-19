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
  self.tag = assetType;
}

@end
