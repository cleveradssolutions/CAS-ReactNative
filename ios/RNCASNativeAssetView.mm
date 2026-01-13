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
@property (nonatomic, assign) BOOL isRegistered;
@end

@implementation RNCASNativeAssetView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CASNativeAssetViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
    _isRegistered = NO;
  }
  return self;
}


#pragma mark - Lifecycle

- (void)didMoveToSuperview {
  [super didMoveToSuperview];
  [self tryRegister];
}

- (void)didMoveToWindow {
  [super didMoveToWindow];
  [self tryRegister];
}

- (void)prepareForRecycle {
  self.isRegistered = NO;
  [super prepareForRecycle];
}


#pragma mark - Props

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &newProps =
  *std::static_pointer_cast<const CASNativeAssetViewProps>(props);
  
  self.assetType = newProps.assetType;
  [super updateProps:props oldProps:oldProps];
}

#pragma mark - Registration

- (void)tryRegister {
  if (self.isRegistered || !self.superview) {
    return;
  }
  
  RNCASNativeAdView *nativeAdView = [self findParentNativeAdView];
  if (!nativeAdView) {
    return;
  }
  
  [nativeAdView registerAssetView:self assetType:self.assetType];
  self.isRegistered = YES;
}

- (RNCASNativeAdView *)findParentNativeAdView {
  UIView *view = self.superview;
  while (view) {
    if ([view isKindOfClass:[RNCASNativeAdView class]]) {
      return (RNCASNativeAdView *)view;
    }
    view = view.superview;
  }
  return nil;
}

@end

#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAssetViewCls(void) {
  return RNCASNativeAssetView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
