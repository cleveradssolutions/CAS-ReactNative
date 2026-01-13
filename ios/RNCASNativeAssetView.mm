#ifdef RCT_NEW_ARCH_ENABLED

#import "RNCASNativeAdView.h"
#import "RNCASNativeAssetView.h"

#import <React/RCTConversions.h>
#import "RCTFabricComponentsPlugins.h"

#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNCASNativeAssetView () <RCTCASNativeAssetViewViewProtocol>
@property (nonatomic, assign) NSInteger assetType;
@property (nonatomic, assign) BOOL didRegister;
@end

@implementation RNCASNativeAssetView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CASNativeAssetViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
    _didRegister = NO;
  }
  return self;
}

#pragma mark - Lifecycle

- (void)didMoveToWindow {
  [super didMoveToWindow];
  
  if (!self.window || self.didRegister) {
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


- (void)prepareForRecycle {
  self.didRegister = NO;
  [super prepareForRecycle];
}

#pragma mark - Props update

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {
  
  const auto &newProps =
  *std::static_pointer_cast<const CASNativeAssetViewProps>(props);
      
  if (self.assetType != newProps.assetType) {
    self.assetType = newProps.assetType;

    if (self.window && !self.didRegister) {
      [self didMoveToWindow];
    }
  }

  [super updateProps:props oldProps:oldProps];
}

@end

#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAssetViewCls(void) {
  return RNCASNativeAssetView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
