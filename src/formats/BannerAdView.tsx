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
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useWindowDimensions, NativeSyntheticEvent, ViewProps } from 'react-native';

import type {
  AdViewInfo,
  AdError,
  AdContentInfo,
  BannerAdViewRef,
  BannerAdViewProps,
} from '../types';
import { BannerAdSize } from '../types/BannerAdView';

import CASBannerAdComponent, { Commands } from '../modules/NativeCASAdViewComponent';

type SizeDimensions = { width: number; height: number };

export const BannerAdView = forwardRef<BannerAdViewRef, BannerAdViewProps & ViewProps>(
  function AdView(
    {
      size = BannerAdSize.SMART,
      maxWidth,
      maxHeight,
      autoReload = true,
      refreshInterval = 30,
      onAdViewLoaded,
      onAdViewFailed,
      onAdViewClicked,
      onAdViewImpression,
      style,
      ...otherProps
    },
    ref,
  ) {
    const adViewRef = useRef(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [dimensions, setDimensions] = useState<SizeDimensions>({ width: 1, height: 1 });
    const sizeConfig = useMemo(
      () => ({
        sizeType: size,
        maxWidth: Math.min(maxWidth ?? screenWidth, screenWidth),
        maxHeight: Math.min(maxHeight ?? screenHeight, screenHeight),
      }),
      [size, maxWidth, maxHeight, screenWidth, screenHeight],
    );

    useImperativeHandle(
      ref,
      () => ({
        loadAd: () => {
          adViewRef.current && Commands.loadAd(adViewRef.current);
        },
      }),
      [],
    );

    const onLoadedCallback = useCallback(
      (e: NativeSyntheticEvent<AdViewInfo>) => {
        const w = Math.ceil(e.nativeEvent.width);
        const h = Math.ceil(e.nativeEvent.height);

        if (w != dimensions.width || h != dimensions.height) {
          setDimensions({ width: w, height: h });
        }

        onAdViewLoaded?.(e.nativeEvent);
      },
      [onAdViewLoaded],
    );

    const onFailedCallback = useCallback(
      (e: NativeSyntheticEvent<AdError>) => {
        onAdViewFailed?.(e.nativeEvent as AdError);
      },
      [onAdViewFailed],
    );

    const onImpressionCallback = useCallback(
      (e: NativeSyntheticEvent<AdContentInfo>) => {
        onAdViewImpression?.(e.nativeEvent as AdContentInfo);
      },
      [onAdViewImpression],
    );

    const onClickedCallback = useCallback(() => onAdViewClicked?.(), [onAdViewClicked]);

    return (
      <CASBannerAdComponent
        ref={adViewRef}
        sizeConfig={sizeConfig}
        autoReload={autoReload}
        refreshInterval={refreshInterval}
        onAdViewLoaded={onLoadedCallback}
        onAdViewFailed={onFailedCallback}
        onAdViewClicked={onClickedCallback}
        onAdViewImpression={onImpressionCallback}
        style={[style, dimensions]}
        {...otherProps}
      />
    );
  },
);
