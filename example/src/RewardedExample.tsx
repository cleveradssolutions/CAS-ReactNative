import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import { RewardedAd, type AdError, type AdContentInfo } from 'react-native-cas';

const isAutoloadEnabled = true as const;

export default function RewardedExample() {
  const [loaded, setLoaded] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribeReward = RewardedAd.addAdUserEarnRewardEventListener(() => {
      console.log('Rewarded Ad gives a reward to the user');
    });

    const unsubscribeLoaded = RewardedAd.addAdLoadedEventListener(() => {
      console.log('Rewarded Ad loaded');
      setLoaded(true);
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    });

    const unsubscribeLoadFailed = RewardedAd.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('Rewarded Ad failed to load:', e);
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          RewardedAd.loadAd();
        }, 10000);
      }
    });

    const unsubscribeClicked = RewardedAd.addAdClickedEventListener(() => {
      console.log('Rewarded Ad clicked');
    });

    const unsubscribeShowed = RewardedAd.addAdShowedEventListener(() => {
      console.log('Rewarded Ad showed');
    });

    const unsubscribeFailShow = RewardedAd.addAdFailedToShowEventListener((e: AdError) => {
      console.log('Rewarded Ad failed to show:', e);
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        RewardedAd.loadAd();
      }
    });

    const unsubscribeDismissed = RewardedAd.addAdDismissedEventListener(() => {
      console.log('Rewarded Ad dismissed');
      setLoaded(false);
      if (isAutoloadEnabled) {
        // just wait auto reload
      } else {
        RewardedAd.loadAd();
      }
    });

    const unsubscribeImpression = RewardedAd.addAdImpressionEventListener((info: AdContentInfo) => {
      console.log('Rewarded Ad impression:', info);
    });

    if (isAutoloadEnabled) {
      RewardedAd.setAutoloadEnabled(isAutoloadEnabled);
    } else {
      RewardedAd.loadAd();
    }

    return () => {
      unsubscribeReward();
      unsubscribeLoaded();
      unsubscribeLoadFailed();
      unsubscribeClicked();
      unsubscribeShowed();
      unsubscribeFailShow();
      unsubscribeDismissed();
      unsubscribeImpression();
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const onPressLoadButton = () => RewardedAd.loadAd();

  const onPressShowButton = () => {
    setLoaded(false);
    RewardedAd.showAd();
  };

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Rewarded</Text>
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
