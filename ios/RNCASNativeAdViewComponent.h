#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import <Foundation/Foundation.h>
#import <React/RCTView.h>
#import <UIKit/UIKit.h>

#ifndef RNCASNativeAdViewComponent_h
#define RNCASNativeAdViewComponent_h

NS_ASSUME_NONNULL_BEGIN

@interface RNCASNativeAdViewComponent : RCTView

// MARK: - Properties are updated from RN layer via the view manager

@property (nonatomic, assign) NSInteger instanceId;

// ad view size
@property (nonatomic, assign) CGFloat width;
@property (nonatomic, assign) CGFloat height;

// Colors
@property (nonatomic, strong, nullable) UIColor *backgroundColor;

// Font style
@property (nonatomic, copy, nullable) NSString *headlineFontStyle;
@property (nonatomic, copy, nullable) NSString *secondaryFontStyle;

@end

NS_ASSUME_NONNULL_END

#endif /* RNCASNativeAdViewComponent_h */
