import React, { useRef, useCallback } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import {
  BannerAdView,
  BannerAdSize,
  type BannerAdViewRef,
  type AdViewInfo,
  type AdError,
  type AdContentInfo,
} from 'react-native-cas';

export default function AdaptiveBannerExample() {
  const bannerRef = useRef<BannerAdViewRef>(null);

  const onLoadedCallback = useCallback((info: AdViewInfo) => {
    console.log('Adaptive banner ad loaded', info);
  }, []);

  const onFailedCallback = useCallback((error: AdError) => {
    console.log('Adaptive banner ad failed', error);
  }, []);

  const onClickedCallback = useCallback(() => {
    console.log('Adaptive banner ad clicked');
  }, []);

  const onImpressionCallback = useCallback((info: AdContentInfo) => {
    console.log('Adaptive banner ad impression', info);
  }, []);

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Adaptive Banner Ad</Text>
      </View>
      <BannerAdView
        ref={bannerRef}
        size={BannerAdSize.ADAPTIVE}
        // The Adaptive size has the width of the screen.
        // You can limit it by specifying a maxWidth.
        //maxWidth={}
        autoReload={true}
        refreshInterval={30}
        onAdViewLoaded={onLoadedCallback}
        onAdViewFailed={onFailedCallback}
        onAdViewClicked={onClickedCallback}
        onAdViewImpression={onImpressionCallback}
      />
    </View>
  );
}

const S = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 20, android: 12 }),
    paddingBottom: Platform.select({ ios: 24, android: 16 }),
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: '#121821',
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8EEF6',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: { fontSize: 14, color: '#A5B3C5', textAlign: 'center', marginBottom: 16 },
  stack: { gap: 12 },
});
