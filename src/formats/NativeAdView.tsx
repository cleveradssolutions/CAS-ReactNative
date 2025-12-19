import React, { forwardRef, useRef } from 'react';
import { useWindowDimensions, ViewProps } from 'react-native';

import type { NativeAdViewProps, NativeAdViewRef } from '../types/NativeAdType';

import CASNativeAdViewComponent from '../modules/NativeCASNativeAdViewComponent';

/**
 * React wrapper for the Native Ad View.
 *
 * Provides the necessary props and passes them
 * to the underlying native component instance.
 */
export const NativeAdView = forwardRef<NativeAdViewRef, NativeAdViewProps & ViewProps>(
  function NativeAdView({ ad, width, height, templateStyle, children, style }, _) {  
    const adViewRef = useRef(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    return (
      <CASNativeAdViewComponent
        ref={adViewRef}
        instanceId={ad.instanceId}
        width={Math.min(width ?? screenWidth, screenWidth)}
        height={Math.min(height ?? screenHeight, screenHeight)}
        backgroundColor={templateStyle?.backgroundColor}                        
        headlineFontStyle={templateStyle?.headlineFontStyle}        
        secondaryFontStyle={templateStyle?.secondaryFontStyle}        
        style={style}       
      >      
        {children}
      </CASNativeAdViewComponent>
    );
  },
);
