#import "RNCASNativeAdAssetBinder.h"
#import <CleverAdsSolutions/CleverAdsSolutions-Swift.h>
#import "CASMobileAds.h"

@implementation RNCASNativeAdAssetBinder

#pragma mark - Asset lifecycle helpers

+ (BOOL)isAssetTag:(NSInteger)tag {
  return tag >= 101 && tag <= 112;
}

+ (UIView *)createSDKAssetView:(NSInteger)tag {
  switch (tag) {
    case 101: return [[UILabel alloc] init];        // HEADLINE
    case 102: return [[CASMediaView alloc] init];   // MEDIA
    case 103: return [[UIButton alloc] init];       // CALL TO ACTION
    case 104: return [[UIImageView alloc] init];    // ICON
    case 105: return [[UILabel alloc] init];        // BODY
    case 106: return [[UILabel alloc] init];        // PRICE
    case 107: return [[UILabel alloc] init];        // ADVERTISER
    case 108: return [[UILabel alloc] init];        // STORE
    case 109: return [[UIView alloc] init];         // STAR RATING
    case 110: return [[UILabel alloc] init];        // REVIEW COUNT
    case 111: return [[UILabel alloc] init];        // AD LABEL
    case 112: return [[CASChoicesView alloc] init]; // AD CHOICES
    default: return nil;
  }
}

+ (void)registerAssetView:(UIView *)view
                   forTag:(NSInteger)tag
                nativeView:(CASNativeView *)nativeView {
  switch (tag) {
    case 101: nativeView.headlineView = (UILabel *)view; break;
    case 102: nativeView.mediaView = (CASMediaView *)view; break;
    case 103: nativeView.callToActionView = (UIButton *)view; break;
    case 104: nativeView.iconView = (UIImageView *)view; break;
    case 105: nativeView.bodyView = (UILabel *)view; break;
    case 106: nativeView.priceView = (UILabel *)view; break;
    case 107: nativeView.advertiserView = (UILabel *)view; break;
    case 108: nativeView.storeView = (UILabel *)view; break;
    case 109: nativeView.starRatingView = view; break;
    case 110: nativeView.reviewCountView = (UILabel *)view; break;
    case 111: nativeView.adLabelView = (UILabel *)view; break;
    case 112: nativeView.adChoicesView = (CASChoicesView *)view; break;
  }
}

+ (void)bindAssetsIfPossibleForNativeView:(CASNativeView *)nativeView
                         placeholders:(NSMutableDictionary<NSNumber *, UIView *> *)placeholders
                                views:(NSMutableDictionary<NSNumber *, UIView *> *)views {

  if (!nativeView) return;

  for (NSNumber *key in placeholders) {
    UIView *placeholder = placeholders[key];

    if (placeholder.superview != nativeView) {
      [nativeView addSubview:placeholder];
    }

    UIView *assetView = views[key];
    if (!assetView) {
      assetView = [self createSDKAssetView:key.integerValue];
      if (!assetView) continue;

      assetView.frame = placeholder.bounds;
      assetView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

      [placeholder addSubview:assetView];
      views[key] = assetView;

      [self registerAssetView:assetView forTag:key.integerValue nativeView:nativeView];
    }

    assetView.frame = placeholder.bounds;
  }
}

@end
