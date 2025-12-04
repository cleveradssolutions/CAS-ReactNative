#import <Foundation/Foundation.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNCASNativeAdHolder : NSObject

@property (nonatomic, strong, nullable) CASNativeAdContent *ad;

+ (instancetype)shared;

- (NSNumber*)saveNativeAd:(CASNativeAdContent *)ad;
- (nullable CASNativeAdContent *)findNativeAdWithId:(NSNumber*)instanceId;
- (nullable CASNativeAdContent *)removeNativeAdWithId:(NSNumber*)instanceId;

@end

NS_ASSUME_NONNULL_END
