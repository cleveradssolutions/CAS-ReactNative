//
//  CasModule.m
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(MediationManagerModule, RCTEventEmitter)

RCT_EXTERN_METHOD(setLastPageAdContent:(NSDictionary*)content)

RCT_EXTERN_METHOD(loadInterstitial)
RCT_EXTERN_METHOD(isInterstitialReady:(RCTPromiseResolveBlock*) resolve
                  rejecter: (RCTPromiseRejectBlock*) reject)
RCT_EXTERN_METHOD(showInterstitial:(NSString*) callbackId)

RCT_EXTERN_METHOD(loadRewardedAd)
RCT_EXTERN_METHOD(isRewardedAdReady:(RCTPromiseResolveBlock*) resolve
                  rejecter: (RCTPromiseRejectBlock*) reject)
RCT_EXTERN_METHOD(showRewardedAd:(NSString*) callbackId)

RCT_EXTERN_METHOD(enableAppReturnAds:(NSString*) callbackId)
RCT_EXTERN_METHOD(disableAppReturnAds)
RCT_EXTERN_METHOD(skipNextAppReturnAds)

RCT_EXTERN_METHOD(loadAppOpenAd:(BOOL) isLandscape)
RCT_EXTERN_METHOD(isAppOpenAdAvailable:(RCTPromiseResolveBlock*) resolve
                  rejecter: (RCTPromiseRejectBlock*) reject)
RCT_EXTERN_METHOD(showAppOpenAd:(NSString*) callbackId)

@end

