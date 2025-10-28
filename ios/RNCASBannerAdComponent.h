#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import <Foundation/Foundation.h>
#import <React/RCTView.h>
#import <UIKit/UIKit.h>

#ifndef RNCASBannerAdComponent_h
#define RNCASBannerAdComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface RNCASBannerAdComponent : RCTView

// MARK: - Properties are updated from RN layer via the view manager
@property (nonatomic, copy) NSDictionary *sizeConfig;
@property (nonatomic, copy) NSString *casID;
@property (nonatomic) BOOL autoReload;
@property (nonatomic) NSInteger refreshInterval;

// MARK: - React Event Callbacks
@property (nonatomic, copy, nullable) RCTDirectEventBlock onAdViewLoaded;
@property (nonatomic, copy, nullable) RCTDirectEventBlock onAdViewFailed;
@property (nonatomic, copy, nullable) RCTDirectEventBlock onAdViewClicked;
@property (nonatomic, copy, nullable) RCTDirectEventBlock onAdViewImpression;

// MARK: - Public Methods
- (void)loadAd;

@end

NS_ASSUME_NONNULL_END

#endif /* ifndef RNCASBannerAdComponent_h */
