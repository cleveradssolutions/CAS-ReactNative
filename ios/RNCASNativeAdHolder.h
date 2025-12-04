#import <Foundation/Foundation.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNCASNativeAdHolder : NSObject

@property (nonatomic, strong, nullable) CASNativeAdContent *ad;

+ (instancetype)shared;

- (void)setAd:(CASNativeAdContent *)ad;
- (nullable CASNativeAdContent *)getAd;

@end

NS_ASSUME_NONNULL_END
