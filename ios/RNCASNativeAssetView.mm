#ifdef RCT_NEW_ARCH_ENABLED

#import "RNCASNativeAssetView.h"

#import <React/RCTConversions.h>
#import "RCTFabricComponentsPlugins.h"

#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNCASNativeAssetView () <RCTCASNativeAssetViewViewProtocol>
@property (nonatomic, assign) int assetType;
@end

@implementation RNCASNativeAssetView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CASNativeAssetViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
  }
  return self;
}

#pragma mark - Props update

- (void)updateProps:(const Props::Shared &)props
           oldProps:(const Props::Shared &)oldProps {

  const auto &newProps =
      *std::static_pointer_cast<const CASNativeAssetViewProps>(props);

  NSInteger assetType = newProps.assetType;

  if (self.tag != assetType) {
    self.tag = assetType;
  }

  [super updateProps:props oldProps:oldProps];
}

@end

#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAssetViewCls(void) {
    return RNCASNativeAssetView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
