#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNCASMobileAdsSpec/RNCASMobileAdsSpec.h>

@interface CASMobileAds : RCTEventEmitter <NativeCASMobileAdsModuleSpec, CASScreenContentDelegate, CASImpressionDelegate, CASNativeLoaderDelegate, CASNativeAdContentDelegate>
#else
#import <React/RCTBridgeModule.h>

@interface CASMobileAds : RCTEventEmitter <RCTBridgeModule, CASScreenContentDelegate, CASImpressionDelegate>
#endif

@property (class, readonly, copy) NSString *casIdendifier;

@end

NSDictionary * RNCASNSDictionaryFromContentInfo(CASContentInfo *info);
NSString * RNCASNSStringFromRevenuePresision(CASRevenuePrecision precision);
CASSize * RNCASSizeWithType(unichar sizeType, CGFloat maxWidth, CGFloat maxHeight);
CASChoicesPlacement RNCASChoicesPlacementFromLong(long value);

#define kOnAppOpenLoaded            @"onAppOpenLoaded"
#define kOnAppOpenLoadFailed        @"onAppOpenFailedToLoad"
#define kOnAppOpenShowed            @"onAppOpenShowed"
#define kOnAppOpenFailedToShow      @"onAppOpenFailedToShow"
#define kOnAppOpenHidden            @"onAppOpenDismissed"
#define kOnAppOpenClicked           @"onAppOpenClicked"
#define kOnAppOpenImpression        @"onAppOpenImpression"

#define kOnInterstitialLoaded       @"onInterstitialLoaded"
#define kOnInterstitialLoadFailed   @"onInterstitialFailedToLoad"
#define kOnInterstitialClicked      @"onInterstitialClicked"
#define kOnInterstitialShowed       @"onInterstitialShowed"
#define kOnInterstitialFailedToShow @"onInterstitialFailedToShow"
#define kOnInterstitialHidden       @"onInterstitialDismissed"
#define kOnInterstitialImpression   @"onInterstitialImpression"

#define kOnRewardedLoaded           @"onRewardedLoaded"
#define kOnRewardedLoadFailed       @"onRewardedFailedToLoad"
#define kOnRewardedClicked          @"onRewardedClicked"
#define kOnRewardedShowed           @"onRewardedShowed"
#define kOnRewardedFailedToShow     @"onRewardedFailedToShow"
#define kOnRewardedHidden           @"onRewardedDismissed"
#define kOnRewardedCompleted        @"onRewardedCompleted"
#define kOnRewardedImpression       @"onRewardedImpression"

#define kOnNativeAdLoaded           @"onNativeAdLoaded"
#define kOnNativeAdFailedToLoad     @"onNativeAdFailedToLoad"
#define kOnNativeAdImpression       @"onNativeAdImpression"
#define kOnNativeAdClicked          @"onNativeAdClicked"
