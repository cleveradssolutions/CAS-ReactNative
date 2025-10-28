import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, StyleSheet, View, Button, Text, Animated } from 'react-native';
import {
  BannerAdView,
  BannerAdSize,
  type AdViewRef,
  type AdViewInfo,
  type AdError,
  type AdContentInfo,
} from 'react-native-cas';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BannerExample() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const bannerRef = useRef<AdViewRef>(null);
  const translateY = useRef(new Animated.Value(120)).current;
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = null;
    };
  }, []);

  useEffect(() => {
    const anim = Animated.timing(translateY, {
      toValue: visible && loaded ? 0 : 120,
      duration: visible && loaded ? 180 : 160,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [visible, loaded, translateY]);

  const onAdLoadedCallback = useCallback((data: AdViewInfo) => {
    console.log('Banner Ad loaded', data);
    setLoaded(true);
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  const onAdFailedCallback = useCallback((err: AdError) => {
    console.log('Banner Ad load failed', err);
    setLoaded(false);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;
      bannerRef.current?.loadAd();
    }, 10000);
  }, []);

  const onAdClickedCallback = useCallback(() => {
    console.log('Banner Ad clicked');
  }, []);

  const onAdImpressionCallback = useCallback((info: AdContentInfo) => {
    console.log('Banner Ad impression', info);
  }, []);

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Banner</Text>
        <View style={S.stack}>
          <Button
            title={visible ? 'Hide Banner' : 'Show Banner'}
            onPress={() => setVisible(v => !v)}
          />
          <Button
            title="Reload Ad"
            onPress={() => {
              setLoaded(false);
              bannerRef.current?.loadAd();
            }}
          />
        </View>
      </View>

      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[
          S.dock,
          {
            paddingBottom: (insets.bottom || 0) + 6,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={S.bannerBox}>
          <BannerAdView
            ref={bannerRef}
            size={BannerAdSize.SMART}
            autoReload={false}
            refreshInterval={30}
            onAdViewLoaded={onAdLoadedCallback}
            onAdViewFailed={onAdFailedCallback}
            onAdViewClicked={onAdClickedCallback}
            onAdViewImpression={onAdImpressionCallback}
          />
        </View>
      </Animated.View>
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
  stack: { gap: 12 },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 36, android: 0 }),
    backgroundColor: '#000',
    paddingVertical: 6,
  },
  bannerBox: { width: '100%', alignItems: 'center' },
});
