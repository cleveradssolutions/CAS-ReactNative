#ifdef RCT_NEW_ARCH_ENABLED

#import "RNCASNativeAdView.h"
#import "RNCASNativeAssetView.h"
#import "RNCASStarRatingContainer.h"
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

#import <objc/runtime.h>
#import "RCTFabricComponentsPlugins.h"
#import <React/RCTConversions.h>

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNCASNativeAssetView () <RCTCASNativeAssetViewViewProtocol>
@property(nonatomic, assign) NSInteger assetType;
@property(nonatomic, assign) BOOL didRegister;
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


- (RNCASNativeAdView *)findAdView {
  UIView *view = self.superview;
  while (view) {
    if ([view isKindOfClass:[RNCASNativeAdView class]]) {
      return (RNCASNativeAdView *)view;
    }
    view = view.superview;
  }
  return nil;
}

- (void)layoutSubviews {
  [super layoutSubviews];
  
  if (CGRectIsEmpty(self.bounds)) {
    return;
  }
  
  if (!self.subviews.count) {
    UIView *assetView = [self createSDKAssetView];
    assetView.frame = self.bounds;
    
    RNCASNativeAdView *adView = [self findAdView];
    if (adView) {
      [adView registerAssetView:assetView assetType:self.assetType];
    }
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
    case 2: { // CALL TO ACTION
      UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
      button.frame = self.bounds;
      button.autoresizingMask =
      UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
      
      button.backgroundColor = UIColor.clearColor;
      [button setTitle:nil forState:UIControlStateNormal];
      button.userInteractionEnabled = YES;
      
      view = button;
      break;
    }
    case 9: { // ICON
      UIImageView *icon = [[UIImageView alloc] initWithFrame:self.bounds];
      icon.contentMode = UIViewContentModeScaleAspectFit;
      view = icon;
      break;
    }
    case 7: { // STAR_RATING
      RNCASStarRatingContainer *stars =
      [[RNCASStarRatingContainer alloc] initWithFrame:self.bounds];
      
      stars.autoresizingMask =
      UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
      
      view = stars;
      break;
    }
    case 10: { // MEDIA
      view = [[CASMediaView alloc] initWithFrame:self.bounds];
      break;
    }
    case 11: { // AD CHOICES
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
