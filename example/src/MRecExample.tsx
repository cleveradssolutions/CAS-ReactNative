import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Button, Text, Animated } from 'react-native';
import {
  BannerAdView,
  BannerAdSize,
  type BannerAdViewRef,
  type AdViewInfo,
  type AdError,
  type AdContentInfo,
} from 'react-native-cas';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MRecExample() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const adRef = useRef<BannerAdViewRef>(null);
  const translateY = useRef(new Animated.Value(320)).current;
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoaded(false);
    adRef.current?.loadAd();
  }, []);

  useEffect(() => {
    const anim = Animated.timing(translateY, {
      toValue: visible && loaded ? 0 : 320,
      duration: visible && loaded ? 180 : 160,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [visible, loaded, translateY]);

  const onAdLoadedCallback = useCallback((data: AdViewInfo) => {
    console.log('MREC Banner Ad loaded', data);
    setLoaded(true);
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  const onAdFailedCallback = useCallback((err: AdError) => {
    console.log('MREC Banner Ad failed to load:', err);
    setLoaded(false);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => {
      retryTimer.current = null;
      adRef.current?.loadAd();
    }, 10000);
  }, []);

  const onAdClickedCallback = useCallback(() => {
    console.log('MREC Banner Ad clicked');
  }, []);

  const onAdImpressionCallback = useCallback((info: AdContentInfo) => {
    console.log('MREC Banner Ad impression', info);
  }, []);

  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      retryTimer.current = null;
    };
  }, []);

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>MREC</Text>
        <View style={S.stack}>
          <Button title={visible ? 'Hide' : 'Show'} onPress={() => setVisible(v => !v)} />
          <Button
            title="Reload (ref)"
            onPress={() => {
              setLoaded(false);
              adRef.current?.loadAd();
            }}
          />
        </View>
      </View>

      <Animated.View
        style={[
          S.dock,
          {
            paddingBottom: (insets.bottom || 0) + 6,
            transform: [{ translateY }],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <View style={S.centerRow}>
          <BannerAdView
            ref={adRef}
            size={BannerAdSize.MEDIUM_RECTANGLE}
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
    paddingBottom: Platform.select({ ios: 24, android: 86 }),
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
    paddingVertical: 6,
  },
  centerRow: { width: '100%', alignItems: 'center' },
});
