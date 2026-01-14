#ifdef RCT_NEW_ARCH_ENABLED

#import "RNCASNativeAssetView.h"
#import "RNCASNativeAdView.h"
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import "RCTFabricComponentsPlugins.h"
#import <React/RCTConversions.h>

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNCASNativeAssetView () <RCTCASNativeAssetViewViewProtocol>
@property(nonatomic, assign) NSInteger assetType;
@end

@implementation RNCASNativeAssetView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<CASNativeAssetViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    // self.clipsToBounds = YES;
  }
  return self;
}

#pragma mark - Lifecycle

+ (BOOL)shouldBeRecycled {
  return NO;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps {
  const auto &newProps = *std::static_pointer_cast<const CASNativeAssetViewProps>(props);

  self.assetType = newProps.assetType;
  [super updateProps:props oldProps:oldProps];
}

- (void)didMoveToWindow {
  [super didMoveToWindow];

  UIView *view = self.superview;
  while (view) {
    if ([view isKindOfClass:[RNCASNativeAdView class]]) {
      RNCASNativeAdView *adView = (RNCASNativeAdView *)view;
      UIView *assetView = self.subviews.firstObject ?: [self createSDKAssetView];
      [adView registerAssetView:self assetType:self.assetType];
      return;
    }
    view = view.superview;
  }
}

- (CGSize)intrinsicContentSize {
  if (self.subviews.count) {
    return self.subviews.firstObject.intrinsicContentSize;
  }
  return super.intrinsicContentSize;
}

- (UIView *)createSDKAssetView {
  UIView *view;
  switch (self.assetType) {
  case 102: { // MEDIA
    view = [[CASMediaView alloc] initWithFrame:self.bounds];
    break;
  }
  case 103: { // CALL TO ACTION
    UIButton *button = [[UIButton alloc] initWithFrame:self.bounds];
    button.backgroundColor = UIColor.clearColor;
    [button setTitleColor:UIColor.clearColor forState:UIControlStateNormal];
    view = button;
    break;
  }
  case 104: { // ICON
    UIImageView *icon = [[UIImageView alloc] initWithFrame:self.bounds];
    icon.contentMode = UIViewContentModeScaleAspectFit;
    view = icon;
    break;
  }
  case 109: { // STAR RATING
    view = [[CASStarRatingView alloc] init];
    break;
  }
  case 112: { // AD CHOICES
    view = [[CASChoicesView alloc] initWithFrame:self.bounds];
    break;
  }
  default: {
    @throw [NSException exceptionWithName:NSInvalidArgumentException
                                   reason:@"Not supported asset type"
                                 userInfo:nil];
  }
  }
  [self addSubview:view];
  return view;
}

@end

#pragma mark - RNCASNativeAdViewCls

Class<RCTComponentViewProtocol> RNCASNativeAssetViewCls(void) { return RNCASNativeAssetView.class; }

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
