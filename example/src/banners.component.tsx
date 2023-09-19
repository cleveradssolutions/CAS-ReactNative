import React, { useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { BannerAd, BannerAdSize } from 'react-native-cas';
import type { BannerAdRef } from 'react-native-cas';
import { useCasContext } from './cas.context';
import { Button } from 'react-native';

export const Banners = () => {
  const context = useCasContext();
  const ref = useRef<BannerAdRef | null>(null);

  const nextAd = useCallback(() => {
    ref.current?.loadNextAd();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <Button title={'Next ad'} onPress={nextAd} />
      <BannerAd
        size={BannerAdSize.Banner}
        onAdViewLoaded={() => context.logCasInfo('Banner ad loaded')}
        onAdViewClicked={() => context.logCasInfo('Banner ad clicked')}
        onAdViewFailed={(e) =>
          context.logCasInfo('Banner ad failed', JSON.stringify(e))
        }
        onAdViewPresented={(e) => {
          context.logCasInfo('Banner ad presented', JSON.stringify(e));
        }}
      />
      <BannerAd
        ref={ref}
        isAutoloadEnabled={false}
        size={BannerAdSize.MediumRectangle}
      />
      <BannerAd size={BannerAdSize.Leaderboard} refreshInterval={20} />
      <BannerAd size={BannerAdSize.Smart} />
    </SafeAreaView>
  );
};
