#ifdef RCT_NEW_ARCH_ENABLED

#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import "CASMobileAds.h"
#import "RNCASBannerAdView.h"

#import <react/renderer/components/RNCASMobileAdsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNCASMobileAdsSpec/EventEmitters.h>
#import <react/renderer/components/RNCASMobileAdsSpec/Props.h>
#import <react/renderer/components/RNCASMobileAdsSpec/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface RNCASBannerAdView () <RCTCASAdViewViewProtocol, CASBannerDelegate, CASImpressionDelegate>
@property (nonatomic, strong, nullable) CASBannerView *bannerView;
@end

@implementation RNCASBannerAdView

+ (ComponentDescriptorProvider)componentDescriptorProvider {
    return concreteComponentDescriptorProvider<CASAdViewComponentDescriptor>();
}

/// Order of function calls
/// 1. `initWithFrame` – creation of the container
/// 2. `updateProps` – updating parameters when ``CASAdViewProps`` change
/// 3. `handleCommand` – function calls from JavaScript
/// 4. `prepareForRecycle` – when the view is unmounted
/// 5. After that, the same container can be reused for another mount, starting from step 2.
/// Recycle enabled by default and can be disabled by function:
/// ```
/// + (BOOL)shouldBeRecycled {
///   return NO;
/// }
/// ```
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        static const auto defaultProps = std::make_shared<const CASAdViewProps>();
        _props = defaultProps;
    }
  
    return self;
}


- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
    const auto &newProps = *std::static_pointer_cast<CASAdViewProps const>(props);

    NSString *identifier = RCTNSStringFromStringNilIfEmpty(newProps.casId) ? : CASMobileAds.casIdendifier;

    CASSize *adSize = RNCASSizeWithType(newProps.sizeConfig.sizeType[0],
                                        newProps.sizeConfig.maxWidth,
                                        newProps.sizeConfig.maxHeight);

    BOOL firstLoad = NO;

    if (self.bannerView) {
        firstLoad = ![self.bannerView.adSize isEqual:adSize];

        if (firstLoad) {
            self.bannerView.adSize = adSize;
        }
    } else {
        firstLoad = YES;
        self.bannerView = [[CASBannerView alloc] initWithCasID:identifier size:adSize origin:CGPointZero];
        self.bannerView.isAutoloadEnabled = NO;
        self.bannerView.delegate = self;
        self.bannerView.impressionDelegate = self;
        self.bannerView.translatesAutoresizingMaskIntoConstraints = YES;
        [self addSubview:_bannerView];
    }

    self.bannerView.refreshInterval = newProps.refreshInterval;
    self.bannerView.isAutoloadEnabled = newProps.autoReload;

    if (firstLoad && !newProps.autoReload) {
        [self.bannerView loadAd];
    }

    [super updateProps:props oldProps:oldProps];
}

- (void)prepareForRecycle {
    self.bannerView.delegate = nil;
    self.bannerView.impressionDelegate = nil;
    [self.bannerView destroy];
    [self.bannerView removeFromSuperview];
    self.bannerView = nil;

    [super prepareForRecycle];
}

- (void)loadAd {
    if (self.bannerView) {
        [self.bannerView loadAd];
    }
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
    // Codegen implementation of comands
    RCTCASAdViewHandleCommand(self, commandName, args);
}

#pragma mark - CASBannerDelegate

- (void)bannerAdViewDidLoad:(CASBannerView *)view {
    if (_eventEmitter != nullptr) {
        CGSize size = view.intrinsicContentSize;

        std::dynamic_pointer_cast<const CASAdViewEventEmitter>(_eventEmitter)
        ->onAdViewLoaded(CASAdViewEventEmitter::OnAdViewLoaded {
            .width = size.width,
            .height = size.height
        });
    }
}

- (void)bannerAdView:(CASBannerView *)adView didFailWith:(CASError *)error {
    if (_eventEmitter != nullptr) {
        std::dynamic_pointer_cast<const CASAdViewEventEmitter>(_eventEmitter)
        ->onAdViewFailed(CASAdViewEventEmitter::OnAdViewFailed {
            .code = static_cast<int>(error.code),
            .message = RCTStringFromNSString(error.description)
        });
    }
}

- (void)bannerAdViewDidRecordClick:(CASBannerView *)adView {
    if (_eventEmitter != nullptr) {
        std::dynamic_pointer_cast<const CASAdViewEventEmitter>(_eventEmitter)
        ->onAdViewClicked(CASAdViewEventEmitter::OnAdViewClicked {});
    }
}

#pragma mark - CASImpressionDelegate

- (void)adDidRecordImpressionWithInfo:(CASContentInfo *_Nonnull)info {
    if (_eventEmitter != nullptr) {
        std::dynamic_pointer_cast<const CASAdViewEventEmitter>(_eventEmitter)
        ->onAdViewImpression(CASAdViewEventEmitter::OnAdViewImpression {
            .format = RCTStringFromNSString(info.format.label),
            .revenue = info.revenue,
            .revenuePrecision = RCTStringFromNSString(
                RNCASNSStringFromRevenuePresision(info.revenuePrecision)
                ),
            .sourceUnitId = RCTStringFromNSString(info.sourceUnitID),
            .sourceName = RCTStringFromNSString(info.sourceName),
            .creativeId = RCTStringFromNSString(info.creativeID),
            .revenueTotal = info.revenueTotal,
            .impressionDepth = static_cast<int>(info.impressionDepth)
        });
    }
}

@end


#pragma mark - RNCASBannerAdViewCls

Class<RCTComponentViewProtocol> RNCASBannerAdViewCls(void) {
    return RNCASBannerAdView.class;
}

#endif /* ifdef RCT_NEW_ARCH_ENABLED */
