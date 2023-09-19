import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ForwardedRef } from 'react';
import { BannerAdView } from '../utils/native';
import type {
  LayoutChangeEvent,
  LayoutRectangle,
  NativeSyntheticEvent,
} from 'react-native';
import {
  Dimensions,
  findNodeHandle,
  PixelRatio,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import type {
  AdViewFailedEvent,
  AdViewPresentedEvent,
  BannerAdProps,
  BannerAdRef,
} from '../utils/types';
import { BannerAdSize } from '../utils/types';

const pr = PixelRatio.get();

export const isTablet = (() => {
  let pixelDensity = PixelRatio.get();
  const adjustedWidth = Dimensions.get('window').width * pixelDensity;
  const adjustedHeight = Dimensions.get('window').height * pixelDensity;
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  } else
    return (
      pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
    );
})();

const sizes = {
  [BannerAdSize.Banner]: { width: 320, height: 50 },
  [BannerAdSize.Leaderboard]: { width: 728, height: 90 },
  [BannerAdSize.MediumRectangle]: { width: 300, height: 250 },
  [BannerAdSize.Adaptive]: { width: 0, height: 0 },
  [BannerAdSize.Smart]: {
    width: isTablet ? 728 : 320,
    height: isTablet ? 90 : 50,
  },
};

export const BannerAd = forwardRef(
  (props: BannerAdProps, ref: ForwardedRef<BannerAdRef>) => {
    const [size, setSize] = useState(sizes[props.size]);
    const layout = useRef<LayoutRectangle | null>(null);
    const bannerRef = useRef<typeof BannerAdView>();
    const style = useMemo(() => {
      return props.size === BannerAdSize.Adaptive
        ? {
            flex: 1,
            width: Dimensions.get('window').width,
          }
        : StyleSheet.compose(props.style, sizes[props.size]);
    }, [props.size, props.style]);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
      layout.current = e.nativeEvent.layout;
      setSize(e.nativeEvent.layout);
    }, []);

    const onAdViewLoaded = useCallback(
      (e) => {
        let width = e.nativeEvent.width / pr;
        const height = layout.current?.height
          ? layout.current.height
          : e.nativeEvent.height / pr;

        if (Math.floor(width) % 2) {
          width += 1;
        } else {
          width -= 1;
        }

        setSize({
          height,
          width,
        });

        props.onAdViewLoaded?.();
      },
      // eslint-disable-next-line
    [props.onAdViewLoaded]
    );

    const onAdViewFailed = useCallback(
      (e: NativeSyntheticEvent<AdViewFailedEvent>) => {
        props.onAdViewFailed?.(e.nativeEvent);
      },
      // eslint-disable-next-line
    [props.onAdViewFailed]
    );

    const onAdViewClicked = useCallback(() => {
      props.onAdViewClicked?.();
      // eslint-disable-next-line
  }, [props.onAdViewClicked]);

    const onAdViewPresented = useCallback(
      (e: NativeSyntheticEvent<AdViewPresentedEvent>) => {
        props.onAdViewPresented?.(e.nativeEvent);
      },
      // eslint-disable-next-line
    [props.onAdViewPresented]
    );

    const isAdReadyRef = useRef<
      ((value: boolean | PromiseLike<boolean>) => void) | null
    >(null);

    const isAdReady = useCallback(async () => {
      return new Promise<boolean>((res) => {
        isAdReadyRef.current = res;

        UIManager.dispatchViewManagerCommand(
          findNodeHandle(bannerRef.current as any),
          'isAdReady',
          []
        );
      });
    }, []);

    const loadNextAd = useCallback(async () => {
      UIManager.dispatchViewManagerCommand(
        findNodeHandle(bannerRef.current as any),
        'loadNextAd',
        []
      );
    }, []);

    useImperativeHandle(ref, () => ({
      isAdReady,
      loadNextAd,
    }));

    return (
      <View onLayout={onLayout} style={style}>
        <BannerAdView
          // @ts-ignore
          ref={bannerRef}
          size={{
            isAdaptive: props.size === BannerAdSize.Adaptive ? true : undefined,
            maxWidthDpi: props.maxWidthDpi,
            size: props.size,
          }}
          onAdViewPresented={onAdViewPresented}
          onAdViewClicked={onAdViewClicked}
          onAdViewFailed={onAdViewFailed}
          onAdViewLoaded={onAdViewLoaded}
          isAdReady={(ready) => {
            isAdReadyRef.current?.(ready.nativeEvent);
            isAdReadyRef.current = null;
          }}
          style={size}
          isAutoloadEnabled={props.isAutoloadEnabled}
          refreshInterval={props.refreshInterval}
        />
      </View>
    );
  }
);
