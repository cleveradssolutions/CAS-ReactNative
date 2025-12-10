#import <Foundation/Foundation.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNCASNativeAdStore : NSObject

+ (instancetype)shared;

// Returns unique instance ID
- (NSNumber *)saveNativeAd:(CASNativeAdContent *)ad;
- (nullable CASNativeAdContent *)findNativeAdWithId:(NSNumber*)instanceId;
- (nullable CASNativeAdContent *)removeNativeAdWithId:(NSNumber*)instanceId;

@end

NS_ASSUME_NONNULL_END
