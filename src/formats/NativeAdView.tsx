import React, { forwardRef, useRef } from 'react';
import { useWindowDimensions, NativeSyntheticEvent, ViewProps, PlatformColor } from 'react-native';

import type { NativeAdViewProps, NativeAdViewRef } from '../types/NativeAdType';

import CASNativeAdViewComponent from '../modules/NativeCASNativeAdViewComponent';

/**
 * React wrapper for the Native Ad View.
 *
 * Provides the necessary props and passes them
 * to the underlying native component instance.
 */
export const NativeAdView = forwardRef<NativeAdViewRef, NativeAdViewProps & ViewProps>(
  function NativeAdView({ ad, width, height, templateStyle, style, ...otherProps }, ref) {
    const adViewRef = useRef(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    return (
      <CASNativeAdViewComponent
        ref={adViewRef}
        instanceId={ad.instanceId}
        width={Math.min(width ?? screenWidth, screenWidth)}
        height={Math.min(height ?? screenHeight, screenHeight)}
        backgroundColor={templateStyle?.backgroundColor}
        primaryColor={templateStyle?.primaryColor}
        primaryTextColor={templateStyle?.primaryTextColor}
        headlineTextColor={templateStyle?.headlineTextColor}
        headlineFontStyle={templateStyle?.headlineFontStyle}
        secondaryTextColor={templateStyle?.secondaryTextColor}
        secondaryFontStyle={templateStyle?.secondaryFontStyle}
        style={style}
      />
    );
  },
);
