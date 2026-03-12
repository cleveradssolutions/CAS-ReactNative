/*
 * Copyright 2026 CleverAdsSolutions LTD, CAS.AI
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { createContext, forwardRef, RefObject, useContext, useEffect, useRef } from 'react';
import { findNodeHandle, StyleSheet, Text, View, ViewProps } from 'react-native';

import {
  type NativeAdAssetProps,
  type NativeAdTextAssetProps,
  type NativeAdContent,
  type NativeAdViewProps,
  NativeAdAssetType,
} from '../types/NativeAds';

import CASNativeAdViewComponent, { Commands } from '../modules/NativeCASNativeAdViewComponent';
import CASNativeAdAssetView from '../modules/NativeCASNativeAssetComponent';

const getNumericSize = (value?: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

type NativeAdContextType = {
  nativeAd: NativeAdContent;
  adViewRef: RefObject<React.ComponentRef<typeof CASNativeAdViewComponent> | null>;
};
const NativeAdContext = createContext<NativeAdContextType>({} as NativeAdContextType);

const NativeAdViewInner = ({
  ad,
  width,
  height,
  templateStyle,
  children,
  style,
}: NativeAdViewProps & ViewProps) => {
  const ref = useRef<React.ComponentRef<typeof CASNativeAdViewComponent>>(null);
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const useTemplate = React.Children.count(children) === 0;
  const _width = width ?? getNumericSize(flattenedStyle.width);
  const _height = height ?? getNumericSize(flattenedStyle.height);

  return (
    <CASNativeAdViewComponent
      ref={ref}
      instanceId={ad.instanceId}
      width={_width ?? 0}
      height={_height ?? 0}
      usesTemplate={useTemplate}
      backgroundColor={templateStyle?.backgroundColor}
      primaryColor={templateStyle?.primaryColor}
      primaryTextColor={templateStyle?.primaryTextColor}
      headlineTextColor={templateStyle?.headlineTextColor}
      headlineFontStyle={templateStyle?.headlineFontStyle}
      secondaryTextColor={templateStyle?.secondaryTextColor}
      secondaryFontStyle={templateStyle?.secondaryFontStyle}
      style={[{ width: _width, height: _height }, style]}
    >
      <NativeAdContext.Provider value={{ nativeAd: ad, adViewRef: ref }}>
        {children}
      </NativeAdContext.Provider>
    </CASNativeAdViewComponent>
  );
};

type InternalTextAssetProps = NativeAdTextAssetProps & {
  assetType: NativeAdAssetType;
};

const NativeAdTextAssetView = forwardRef<Text, InternalTextAssetProps>(
  function NativeAdTextAssetView({ assetType, ...textProps }, forwardedRef) {
    const localRef = useRef<Text>(null);
    const ref = (forwardedRef ?? localRef) as React.RefObject<Text>;
    const { nativeAd, adViewRef } = useContext(NativeAdContext);

    const assetContent = nativeAd.content[assetType];

    useEffect(() => {
      if (!adViewRef.current || !ref.current || assetContent == null) {
        return;
      }

      const reactTag = findNodeHandle(ref.current);
      if (reactTag != null) {
        Commands.registerAsset(adViewRef.current, assetType, reactTag);
      }
    }, [adViewRef, assetContent]);

    if (assetContent == null) {
      return null;
    }

    return (
      <Text ref={ref} {...textProps}>
        {assetContent}
      </Text>
    );
  },
);

const CallToAction = forwardRef<Text, NativeAdTextAssetProps>(function NativeAdCallToActionView(
  { style, ...textProps },
  ref,
) {
  const { nativeAd } = useContext(NativeAdContext);
  const flattenedStyle = StyleSheet.flatten(style);
  const assetContent = nativeAd.content[NativeAdAssetType.CALL_TO_ACTION];

  if (assetContent == null) {
    return;
  }

  return (
    <View
      style={{
        position: 'relative',
        alignSelf: 'flex-start',
        width: flattenedStyle?.width,
        height: flattenedStyle?.height,
      }}
    >
      <Text ref={ref} style={style} {...textProps}>
        {assetContent}
      </Text>

      <CASNativeAdAssetView
        assetType={NativeAdAssetType.CALL_TO_ACTION}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
});

const Media = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.MEDIA} style={style} />
);
const Icon = function NativeAdIconView({ style }: NativeAdAssetProps) {
  return <CASNativeAdAssetView assetType={NativeAdAssetType.ICON} style={style} />;
};
const Headline = forwardRef<Text, NativeAdTextAssetProps>(
  function NativeAdHeadlineView(props, ref) {
    return <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.HEADLINE} {...props} />;
  },
);
const Body = forwardRef<Text, NativeAdTextAssetProps>(function NativeAdBodyView(props, ref) {
  return <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.BODY} {...props} />;
});
const Price = forwardRef<Text, NativeAdTextAssetProps>(function NativeAdPriceView(props, ref) {
  return <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.PRICE} {...props} />;
});
const Advertiser = forwardRef<Text, NativeAdTextAssetProps>(
  function NativeAdAdvertiserView(props, ref) {
    return <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.ADVERTISER} {...props} />;
  },
);
const Store = forwardRef<Text, NativeAdTextAssetProps>(function NativeAdStoreView(props, ref) {
  return <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.STORE} {...props} />;
});
const StarRating = function NativeAdStarRating({ style }: NativeAdAssetProps) {
  return <CASNativeAdAssetView assetType={NativeAdAssetType.STAR_RATING} style={style} />;
};
const ReviewCount = forwardRef<Text, NativeAdTextAssetProps>(
  function NativeAdReviewCountView(props, ref) {
    return (
      <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.REVIEW_COUNT} {...props} />
    );
  },
);
const AdLabel = forwardRef<Text, NativeAdTextAssetProps>(function NativeAdLabelView(props, ref) {
  return <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.AD_LABEL} {...props} />;
});
const AdChoices = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.AD_CHOICES} style={style} />
);

/**
 * This class is a View that publishers should use as the root for the `NativeAdContent`.
 * A single NativeAdView corresponds to a single native ad.
 * Each view used to display that ad's assets (the Image that displays the screenshot asset,
 * for instance) should be a child of the NativeAdView.
 *
 * Advertising requirements:
 * - The Ad View must be visible and non-transparent.
 * - Don't edit the text content of assets.
 * - Don't edit the content of images.
 * - Native ads smaller than 32x32dp won't serve.
 * Ads this small can be difficult to see or interact with and may adversely affect the display quality of advertiser assets.
 * - At a single point in time, a loaded ad can only be served in one View.
 * Simultaneous display of a single ad in multiple Views may result in the loss of impression.
 * - The app must be active (not running in the background).
 */
type NativeAdViewComponentType = React.ForwardRefExoticComponent<NativeAdViewProps & ViewProps> & {
  /**
   * The MediaView is a special View designed to display the main media asset,
   * either video or image. Can be defined in an XML layout or constructed dynamically.
   * It should be placed within the view hierarchy of a NativeAdView, just like any other asset view.
   * The media view will be populated automatically.
   * Video ads won't serve to implementations with main asset CASMediaView smaller than 120dp in any dimension.
   */
  Media: typeof Media;
  /**
   * Ad AdChoices overlay logo must be displayed at the top of the ad Each ad view must display
   * an AdChoices overlay logo. Also, it's important that the AdChoices overlay be easily seen,
   * so choose background colors and images appropriately.
   *
   * **An AdChoices overlay can be added by the SDK if view not registered.**
   * Use `AdChoicesPlacement` constants to set preferred corner.
   * And leave space in your preferred corner of your native ad view for the automatically
   * inserted AdChoices logo.
   */
  AdChoices: typeof AdChoices;
  /**
   * You must clearly display the text "Ad", "Advertisement", or "Sponsored" (localized appropriately).
   * The badge is required to be a minimum of 15px height and width.
   * Ad attribution must be displayed at the top of the ad.
   */
  AdLabel: typeof AdLabel;
  /**
   * Text for the headline text of the native ad.
   */
  Headline: typeof Headline;
  /**
   * The small app icon or advertiser logo with square aspect ratio (1:1).
   */
  Icon: typeof Icon;
  /**
   * Button that encourages users to take action (for example, "Visit site" or "Install").
   * This text may truncate after 15 characters.
   */
  CallToAction: typeof CallToAction;
  /**
   * Text for the body text of the native ad. This text may truncate after 90 characters.
   */
  Body: typeof Body;
  /**
   * Text for the text that identifies the advertiser (for example, advertiser name, brand name, or visible URL).
   * This text may truncate after 25 characters.
   */
  Price: typeof Price;
  /**
   * Text for the name of the store where the product or service is available.
   */
  Advertiser: typeof Advertiser;
  /**
   * Text for the price of the product or service advertised.
   */
  Store: typeof Store;
  /**
   * The rating from 0.0-5.0 that represents the average rating of the app in a store.
   */
  StarRating: typeof StarRating;
  /**
   * TextView for the number of reviews the app has received.
   */
  ReviewCount: typeof ReviewCount;
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
