#import "RNCASNativeAdHolder.h"

@interface RNCASNativeAdHolder()
  @property(nonatomic) long nativeAdCount;
  @property(nonatomic, strong)
      NSMutableDictionary<NSNumber *, CASNativeAdContent *> *nativeAdContents;
@end

@implementation RNCASNativeAdHolder


- (instancetype)init
{
  self = [super init];
  if (self) {
    _nativeAdContents = [NSMutableDictionary new];
  }
  return self;
}

+ (instancetype)shared {
    static RNCASNativeAdHolder *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[RNCASNativeAdHolder alloc] init];
    });
    return sharedInstance;
}

- (NSNumber *)saveNativeAd:(CASNativeAdContent *)ad{
  
}
- (CASNativeAdContent *)findNativeAdWithId:(NSNumber *)instanceId{
  
}
- (CASNativeAdContent *)removeNativeAdWithId:(NSNumber *)instanceId{
  
}


@end
