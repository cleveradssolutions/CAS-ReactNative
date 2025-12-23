#import <React/RCTView.h>
#import <UIKit/UIKit.h>

#ifndef RNCASNativeAssetViewComponent_h
#define RNCASNativeAssetViewComponent_h

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, RNCASNativeAssetType) {
  RNCASNativeAssetTypeHeadline       = 101,
  RNCASNativeAssetTypeMedia          = 102,
  RNCASNativeAssetTypeCallToAction   = 103,
  RNCASNativeAssetTypeIcon           = 104,
  RNCASNativeAssetTypeBody           = 105,
  RNCASNativeAssetTypePrice          = 106,
  RNCASNativeAssetTypeAdvertiser     = 107,
  RNCASNativeAssetTypeStore          = 108,
  RNCASNativeAssetTypeStarRating     = 109,
  RNCASNativeAssetTypeReviewCount    = 110,
  RNCASNativeAssetTypeAdLabel        = 111,
  RNCASNativeAssetTypeAdChoices      = 112
};

@interface RNCASNativeAssetViewComponent : RCTView

// assetType string from JS: "headline", "icon", "media", etc.
@property (nonatomic, assign) NSInteger assetType;

@end

NS_ASSUME_NONNULL_END

#endif
