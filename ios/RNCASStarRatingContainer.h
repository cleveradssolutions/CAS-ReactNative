#import <UIKit/UIKit.h>
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>

@interface RNCASStarRatingContainer : UIView <CASNativeAdStarRating>
@property (nonatomic, strong) NSNumber *rating;
@end
