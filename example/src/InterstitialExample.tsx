import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import { InterstitialAd, type AdError, type AdContentInfo } from 'react-native-cas';

const isAutoloadEnabled = false;

// Number of ads kept loaded, 1...4. Default 1.
// Out of range values are clamped by the plugin, see the [CAS.AI-RN] log.
const preloadedBufferSize = 2;

export default function InterstitialExample() {
  const [loadedCount, setLoadedCount] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refreshLoadedCount = () => {
      InterstitialAd.getLoadedAdCount().then(count => {
        console.log('Interstitial Ad loaded count:', count);
        setLoadedCount(count);
      });
    };

    const unsubscribeLoaded = InterstitialAd.addAdLoadedEventListener(() => {
      console.log('Interstitial Ad loaded');
      refreshLoadedCount();
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    });

    const unsubscribeLoadFailed = InterstitialAd.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('Interstitial Ad failed to load', e);
      refreshLoadedCount();
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          InterstitialAd.loadAd();
        }, 10000);
      }
    });

    const unsubscribeClicked = InterstitialAd.addAdClickedEventListener(() => {
      console.log('Interstitial Ad clicked');
    });

    const unsubscribeShowed = InterstitialAd.addAdShowedEventListener(() => {
      console.log('Interstitial Ad showed');
      refreshLoadedCount();
    });

    const unsubscribeFailShow = InterstitialAd.addAdFailedToShowEventListener((e: AdError) => {
      console.log('Interstitial Ad failed to show:', e);
      refreshLoadedCount();
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        InterstitialAd.loadAd();
      }
    });

    const unsubscribeDismissed = InterstitialAd.addAdDismissedEventListener(() => {
      console.log('Interstitial Ad dismissed');
      refreshLoadedCount();
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        InterstitialAd.loadAd();
      }
    });

    const unsubscribeImpression = InterstitialAd.addAdImpressionEventListener(
      (info: AdContentInfo) => {
        console.log('Interstitial Ad impression:', info);
      },
    );

    InterstitialAd.setPlacement('TestPlace'); // optional
    InterstitialAd.setMinInterval(0); // default 0 sec
    InterstitialAd.setAutoshowEnabled(false); // default false
    InterstitialAd.setAutoloadEnabled(isAutoloadEnabled); // default false
    InterstitialAd.setPreloadedBufferSize(preloadedBufferSize); // default 1
    if (!isAutoloadEnabled) {
      InterstitialAd.loadAd();
    }

    return () => {
      unsubscribeLoaded();
      unsubscribeLoadFailed();
      unsubscribeClicked();
      unsubscribeShowed();
      unsubscribeFailShow();
      unsubscribeDismissed();
      unsubscribeImpression();
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    };
  }, []);

  const onPressLoadButton = () => {
    InterstitialAd.loadAd();
  };

  const onPressShowButton = () => {
    InterstitialAd.showAd();
  };

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Loaded: {loadedCount}</Text>
        <View style={S.row}>
          <AppButton title="Load" onPress={onPressLoadButton} />
          <AppButton title="Show" onPress={onPressShowButton} enabled={loadedCount > 0} />
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
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
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8EEF6',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: { flexDirection: 'column', gap: 12, justifyContent: 'center', marginBottom: 8 },
});