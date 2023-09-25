//
//  CasModule.m
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#if __has_include(<FBAudienceNetwork/FBAudienceNetwork.h>)
#import <FBAudienceNetwork/FBAudienceNetwork.h>
#endif

@interface RCT_EXTERN_MODULE(CasModule, RCTEventEmitter)

RCT_EXTERN_METHOD(buildManager:(NSDictionary*) params
                  resolver :(RCTPromiseResolveBlock) resolve
                  rejecter :(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(showConsentFlow:(NSDictionary*) params
                  cb: (RCTResponseSenderBlock*) callback)

RCT_EXTERN_METHOD(getSdkVersion:(RCTPromiseResolveBlock) resolve
                  rejecter :(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(getTargetingOptions:(RCTPromiseResolveBlock) resolve
                  rejecter :(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(setTargetingOptions:(NSDictionary*) options)

RCT_EXTERN_METHOD(getSettings:(RCTPromiseResolveBlock) resolve
                  rejecter :(RCTPromiseRejectBlock) reject)

RCT_EXTERN_METHOD(setSettings:(NSDictionary*) settings)

RCT_EXTERN_METHOD(restartInterstitialInterval)

RCT_EXTERN_METHOD(debugValidateIntegration)

#if __has_include(<FBAudienceNetwork/FBAudienceNetwork.h>)

RCT_EXPORT_METHOD(setAdvertiserTrackingEnabled:(bool) enabled {
    [FBAdSettings setAdvertiserTrackingEnabled:enabled];
})

RCT_EXPORT_METHOD(setAudienceNetworkDataProcessingOptions:(NSDictionary*) options {
    NSArray* opt = options[@"options"];
    NSInteger country = [options[@"country"] intValue];
    NSInteger state = [options[@"state"] intValue];
    
    [FBAdSettings setDataProcessingOptions:opt country:country state:state];
})

#endif

@end

