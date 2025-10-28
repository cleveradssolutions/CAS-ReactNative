import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import { InterstitialAd, type AdError, type AdContentInfo } from 'react-native-cas';

const isAutoloadEnabled = false;

export default function InterstitialExample() {
  const [loaded, setLoaded] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribeLoaded = InterstitialAd.addAdLoadedEventListener(() => {
      console.log('Interstitial Ad loaded');
      setLoaded(true);
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    });

    const unsubscribeLoadFailed = InterstitialAd.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('Interstitial Ad failed to load', e);
      setLoaded(false);
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
    });

    const unsubscribeFailShow = InterstitialAd.addAdFailedToShowEventListener((e: AdError) => {
      console.log('Interstitial Ad failed to show:', e);
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        InterstitialAd.loadAd();
      }
    });

    const unsubscribeDismissed = InterstitialAd.addAdDismissedEventListener(() => {
      console.log('Interstitial Ad dismissed');
      setLoaded(false);
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

    if (isAutoloadEnabled) {
      InterstitialAd.setAutoloadEnabled(isAutoloadEnabled);
    } else {
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
    setLoaded(false);
    InterstitialAd.showAd();
  };

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Interstitial</Text>
        <View style={S.row}>
          <AppButton title="Load" onPress={onPressLoadButton} />
          <AppButton title="Show" onPress={onPressShowButton} enabled={loaded} />
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
