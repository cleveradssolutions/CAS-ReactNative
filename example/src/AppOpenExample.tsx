import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AppButton from './components/AppButton';
import { AppOpenAd, type AdError, type AdContentInfo } from 'react-native-cas';

const isAutoloadEnabled = false;

export default function AppOpenExample() {
  const [loaded, setLoaded] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribeLoaded = AppOpenAd.addAdLoadedEventListener(() => {
      console.log('AppOpen Ad loaded');
      setLoaded(true);
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    });

    const unsubscribeLoadFailed = AppOpenAd.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('AppOpen Ad failed to load:', e);
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          AppOpenAd.loadAd();
        }, 10000);
      }
    });

    const unsubscribeClicked = AppOpenAd.addAdClickedEventListener(() => {
      console.log('AppOpen Ad clicked');
    });
    const unsubscribeShowed = AppOpenAd.addAdShowedEventListener(() => {
      console.log('AppOpen Ad showed');
    });
    const unsubscribeShowFailed = AppOpenAd.addAdFailedToShowEventListener((e: AdError) => {
      console.log('AppOpen Ad failed to show with error:', e);
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        AppOpenAd.loadAd();
      }
    });
    const unsubscribeDismissed = AppOpenAd.addAdDismissedEventListener(() => {
      console.log('AppOpen Ad dismissed');
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        AppOpenAd.loadAd();
      }
    });
    const unsubscribeImpression = AppOpenAd.addAdImpressionEventListener((info: AdContentInfo) => {
      console.log('AppOpen Ad impression:', info);
    });

    if (isAutoloadEnabled) {
      AppOpenAd.setAutoloadEnabled(isAutoloadEnabled);
    } else {
      AppOpenAd.loadAd();
    }

    return () => {
      unsubscribeLoaded();
      unsubscribeLoadFailed();
      unsubscribeClicked();
      unsubscribeShowed();
      unsubscribeShowFailed();
      unsubscribeDismissed();
      unsubscribeImpression();
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const onPressLoadButton = () => {
    AppOpenAd.loadAd();
  };

  const onPressShowButton = () => {
    setLoaded(false);
    AppOpenAd.showAd();
  };

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>App Open</Text>
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
