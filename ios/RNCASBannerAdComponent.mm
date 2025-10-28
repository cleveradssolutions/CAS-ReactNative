#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import "CASMobileAds.h"
#import "RNCASBannerAdComponent.h"

@interface RNCASBannerAdComponent () <CASBannerDelegate, CASImpressionDelegate>

@property (nonatomic, strong, nullable) CASBannerView *bannerView;

@end

@implementation RNCASBannerAdComponent

- (void)dealloc {
    if (self.bannerView) {
        [self.bannerView destroy];
        self.bannerView = nil;
    }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    CASSize *adSize = RNCASSizeWithType([self.sizeConfig[@"sizeType"] characterAtIndex:0],
                                        [self.sizeConfig[@"maxWidth"] doubleValue],
                                        [self.sizeConfig[@"maxHeight"] doubleValue]);

    BOOL firstLoad = NO;

    if (self.bannerView) {
        firstLoad = ![self.bannerView.adSize isEqual:adSize];

        if (firstLoad) {
            self.bannerView.adSize = adSize;
        }
    } else {
        firstLoad = YES;
        NSString *identifier = self.casID.length ? self.casID : CASMobileAds.casIdendifier;
        self.bannerView = [[CASBannerView alloc] initWithCasID:identifier size:adSize origin:CGPointZero];
        self.bannerView.isAutoloadEnabled = NO;
        self.bannerView.delegate = self;
        self.bannerView.impressionDelegate = self;
        self.bannerView.translatesAutoresizingMaskIntoConstraints = YES;
        [self addSubview:self.bannerView];
    }

    self.bannerView.refreshInterval = self.refreshInterval;
    self.bannerView.isAutoloadEnabled = self.autoReload;

    if (firstLoad && !self.autoReload) {
        [self.bannerView loadAd];
    }
}

- (void)loadAd {
    if (self.bannerView) {
        [self.bannerView loadAd];
    }
}

#pragma mark - CASBannerDelegate

- (void)bannerAdViewDidLoad:(CASBannerView *)view {
    if (self.onAdViewLoaded) {
        CGSize size = view.intrinsicContentSize;

        self.onAdViewLoaded(@{ @"width": @(size.width), @"height": @(size.height) });
    }
}

- (void)bannerAdView:(CASBannerView *)adView didFailWith:(CASError *)error {
    if (self.onAdViewFailed) {
        self.onAdViewFailed(@{ @"code": @(error.code), @"message": error.description });
    }
}

- (void)bannerAdViewDidRecordClick:(CASBannerView *)adView {
    if (self.onAdViewClicked) {
        self.onAdViewClicked(nil);
    }
}

#pragma mark - CASImpressionDelegate

- (void)adDidRecordImpressionWithInfo:(CASContentInfo *_Nonnull)info {
    if (self.onAdViewImpression) {
        self.onAdViewImpression(RNCASNSDictionaryFromContentInfo(info));
    }
}

@end
