import React from 'react';
import { requireNativeComponent, ViewStyle, StyleProp } from 'react-native';
import type { NativeAd } from './NativeAd';

type NativeAdViewProps = {
  adId: number;
  style?: StyleProp<ViewStyle>;
};

const RNCASNativeAdView =
  requireNativeComponent<NativeAdViewProps>('RNCASNativeAdView');

type Props = {
  ad: NativeAd;
  style?: StyleProp<ViewStyle>;
};

export const NativeAdView: React.FC<Props> = ({ ad, style }) => {
  return <RNCASNativeAdView style={style} adId={ad.adId} />;
};
