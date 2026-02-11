#import "RNCASNativeAdStore.h"

@interface RNCASNativeAdStore ()
@property(nonatomic) long nativeAdCount;
@property(nonatomic, strong)
    NSMutableDictionary<NSNumber *, CASNativeAdContent *> *nativeAdContents;
@end

@implementation RNCASNativeAdStore

+ (instancetype)shared {
    static RNCASNativeAdStore *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[RNCASNativeAdStore alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _nativeAdContents = [NSMutableDictionary new];
        _nativeAdCount = 0;
    }
    return self;
}

#pragma mark - Public Methods

- (NSNumber *)saveNativeAd:(CASNativeAdContent *)ad {
    NSNumber *instanceId = @(self.nativeAdCount);
    self.nativeAdCount++;

    self.nativeAdContents[instanceId] = ad;

    return instanceId;
}

- (CASNativeAdContent *)findNativeAdWithId:(NSNumber *)instanceId {
    return self.nativeAdContents[instanceId];
}

- (CASNativeAdContent *)removeNativeAdWithId:(NSNumber *)instanceId {
    CASNativeAdContent *ad = self.nativeAdContents[instanceId];
    if (ad) {
        [self.nativeAdContents removeObjectForKey:instanceId];
    }
    return ad;
}

@end
