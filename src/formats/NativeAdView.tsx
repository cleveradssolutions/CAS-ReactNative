import React from 'react';
import { useWindowDimensions, ViewProps } from 'react-native';

import type {
  NativeAdAssetProps,
  NativeAdTextAssetProps,
  NativeAdViewProps,
} from '../types/NativeAds';

import CASNativeAdViewComponent from '../modules/NativeCASNativeAdViewComponent';
import CASNativeAdAssetView from '../modules/NativeCASNativeAssetComponent';

const NativeAdViewInner = ({
  ad,
  width,
  height,
  templateStyle,
  children,
  style,
}: NativeAdViewProps & ViewProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return (
    <CASNativeAdViewComponent
      instanceId={ad.instanceId}
      width={Math.min(width ?? screenWidth, screenWidth)}
      height={Math.min(height ?? screenHeight, screenHeight)}
      usesTemplate={React.Children.count(children) === 0}
      backgroundColor={templateStyle?.backgroundColor}
      primaryColor={templateStyle?.primaryColor}
      primaryTextColor={templateStyle?.primaryTextColor}
      headlineTextColor={templateStyle?.headlineTextColor}
      headlineFontStyle={templateStyle?.headlineFontStyle}
      secondaryTextColor={templateStyle?.secondaryTextColor}
      secondaryFontStyle={templateStyle?.secondaryFontStyle}
      style={style}
    >
      {children}
    </CASNativeAdViewComponent>
  );
};

const enum NativeAdAssetType {
  HEADLINE = 101,
  MEDIA = 102,
  CALL_TO_ACTION = 103,
  ICON = 104,
  BODY = 105,
  PRICE = 106,
  ADVERTISER = 107,
  STORE = 108,
  STAR_RATING = 109,
  REVIEW_COUNT = 110,
  AD_LABEL = 111,
  AD_CHOICES = 112,
}

const Media = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.MEDIA} style={style} />
);
const Icon = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.ICON} style={style} />
);
const Headline = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.HEADLINE} style={style} />
);
const CallToAction = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.CALL_TO_ACTION} style={style} />
);
const Body = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.BODY} style={style} />
);
const Price = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.PRICE} style={style} />
);
const Advertiser = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.ADVERTISER} style={style} />
);
const Store = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.STORE} style={style} />
);
const StarRating = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.STAR_RATING} style={style} />
);
const ReviewCount = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.REVIEW_COUNT} style={style} />
);
const AdLabel = ({ style }: NativeAdTextAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.AD_LABEL} style={style} />
);
const AdChoices = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.AD_CHOICES} style={style} />
);

type NativeAdViewComponentType = React.ForwardRefExoticComponent<NativeAdViewProps & ViewProps> & {
  Headline: typeof Headline;
  Icon: typeof Icon;
  Media: typeof Media;
  CallToAction: typeof CallToAction;
  Body: typeof Body;
  Price: typeof Price;
  Advertiser: typeof Advertiser;
  Store: typeof Store;
  StarRating: typeof StarRating;
  ReviewCount: typeof ReviewCount;
  AdLabel: typeof AdLabel;
  AdChoices: typeof AdChoices;
};

const NativeAdView = NativeAdViewInner as NativeAdViewComponentType;

NativeAdView.Media = Media;
NativeAdView.Icon = Icon;
NativeAdView.Headline = Headline;
NativeAdView.CallToAction = CallToAction;
NativeAdView.Body = Body;
NativeAdView.Price = Price;
NativeAdView.Advertiser = Advertiser;
NativeAdView.Store = Store;
NativeAdView.StarRating = StarRating;
NativeAdView.ReviewCount = ReviewCount;
NativeAdView.AdLabel = AdLabel;
NativeAdView.AdChoices = AdChoices;

export { NativeAdView };