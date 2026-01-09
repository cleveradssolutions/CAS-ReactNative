/*
 * Copyright 2025 CleverAdsSolutions LTD, CAS.AI
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

import React, {
  createContext,
  forwardRef,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  findNodeHandle,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextProps,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native';

import type {
  NativeAdAssetProps,
  NativeAdTextAssetProps,
  NativeAdType,
  NativeAdViewProps,
} from '../types/NativeAds';

import CASNativeAdViewComponent, { Commands } from '../modules/NativeCASNativeAdViewComponent';
import CASNativeAdAssetView from '../modules/NativeCASNativeAssetComponent';

const getNumericSize = (value?: unknown): number | undefined =>
  typeof value === 'number' ? value : undefined;

const enum NativeAdAssetType {
  HEADLINE = 0,
  BODY = 1,
  CALL_TO_ACTION = 2,
  ADVERTISER = 3,
  STORE = 4,
  PRICE = 5,
  REVIEW_COUNT = 6,
  STAR_RATING = 7,
  AD_LABEL = 8,
  ICON = 9,
  MEDIA = 10,
  AD_CHOICES = 11,
}

type NativeAdContextType = {
  nativeAd: NativeAdType;
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
  var _width = width ?? getNumericSize(flattenedStyle.width);
  var _height = height ?? getNumericSize(flattenedStyle.height);
  if (useTemplate) {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    _width = _width ?? screenWidth;
    _height = _height ?? screenHeight;
  }

  // TODO: rename backgroundColor property to templateBackgroundColor to avoid Android view conflict
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
  ({ assetType, ...textProps }, forwardedRef) => {
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

const CallToAction = forwardRef<Text, NativeAdTextAssetProps>(({ style, ...textProps }, ref) => {
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
const Icon = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.ICON} style={style} />
);
const Headline = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.HEADLINE} {...props} />
));
const Body = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.BODY} {...props} />
));
const Price = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.PRICE} {...props} />
));
const Advertiser = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.ADVERTISER} {...props} />
));
const Store = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.STORE} {...props} />
));
const StarRating = ({ style }: NativeAdAssetProps) => (
  <CASNativeAdAssetView assetType={NativeAdAssetType.STAR_RATING} style={style} />
);
const ReviewCount = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.REVIEW_COUNT} {...props} />
));
const AdLabel = forwardRef<Text, NativeAdTextAssetProps>((props, ref) => (
  <NativeAdTextAssetView ref={ref} assetType={NativeAdAssetType.AD_LABEL} {...props} />
));
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
