#import "RNCASNativeAdHolder.h"

@implementation RNCASNativeAdHolder

+ (instancetype)shared {
    static RNCASNativeAdHolder *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[RNCASNativeAdHolder alloc] init];
    });
    return sharedInstance;
}

- (void)setAd:(CASNativeAdContent *)ad {
    _ad = ad;
}

- (CASNativeAdContent *)getAd {
    return _ad;
}

@end
