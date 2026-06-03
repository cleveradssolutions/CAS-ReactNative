import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, PixelRatio } from 'react-native';

import AppButton from './components/AppButton';
import { NativeAdLoader, NativeAdView, AdChoicesPlacement } from 'react-native-cas';
import type { NativeAdContent, AdError, AdContentInfo } from 'react-native-cas';

export default function NativeTemplateSizeExample() {
  const { width: winWidth } = useWindowDimensions();

  const [loadedAd, setLoadedAd] = useState<NativeAdContent | null>(null);
  const [muted, setMuted] = useState(false);
  const [templateHeightDp] = useState(250);

  const MIN_INLINE_WIDTH = 300;
  const CARD_HORIZONTAL_PADDING = 20 * 2; // card padding
  const AD_SHELL_PADDING = 14 * 2; // adShell padding

  const cardWidthPx = useMemo(() => {
    return Math.min(winWidth - 40, 420);
  }, [winWidth]);

  const availableWidth = useMemo(() => {
    const w = cardWidthPx - CARD_HORIZONTAL_PADDING - AD_SHELL_PADDING;
    return w > 0 ? Math.round(w) : 0;
  }, [cardWidthPx]);

  const effectiveTemplateWidth = useMemo(() => {
    if (availableWidth <= 0) return 0;
    return Math.max(availableWidth, MIN_INLINE_WIDTH);
  }, [availableWidth]);

  useEffect(() => {
    const unsubLoaded = NativeAdLoader.addAdLoadedEventListener((ad: NativeAdContent) => {
      console.log('Native Ad loaded', ad.instanceId);
      setLoadedAd((prev: NativeAdContent | null) => {
        prev?.destroy();
        return ad;
      });
    });

    const unsubFailed = NativeAdLoader.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('Native Ad failed to load', e);
      setLoadedAd(null);
    });

    const unsubClicked = NativeAdLoader.addAdClickedEventListener(() => {
      console.log('Native Ad clicked');
    });

    const unsubImpression = NativeAdLoader.addAdImpressionEventListener((info: AdContentInfo) => {
      console.log('Native Ad impression', info);
    });

    NativeAdLoader.setAdChoicesPlacement(AdChoicesPlacement.TOP_RIGHT); // default TOP_RIGHT
    NativeAdLoader.setStartVideoMuted(muted); // default true
    NativeAdLoader.setPlacement('TestPlace'); // optional
    NativeAdLoader.loadAd();

    return () => {
      unsubLoaded();
      unsubFailed();
      unsubClicked();
      unsubImpression();

      setLoadedAd((prev: NativeAdContent | null) => {
        prev?.destroy();
        return null;
      });
    };
  }, []);

  const onPressReload = () => {
    NativeAdLoader.loadAds(1);
  };

  const onToggleMute = () => {
    setMuted(!muted);
    NativeAdLoader.setStartVideoMuted(muted);
  };

  const cardDynamicStyle = useMemo(() => ({ width: cardWidthPx }), [cardWidthPx]);
  const nativeRootDynamicStyle = useMemo(
    () => ({ width: effectiveTemplateWidth }),
    [effectiveTemplateWidth],
  );

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.content}>
      <View style={[S.card, cardDynamicStyle]}>
        <View style={S.row}>
          <AppButton title="Reload" onPress={onPressReload} />
          <AppButton title={muted ? 'Unmute' : 'Mute'} onPress={onToggleMute} />
        </View>

        {!loadedAd ? (
          <Text style={S.info}>Loading native ad...</Text>
        ) : (
          <View style={S.adShell}>
            <NativeAdView
              ad={loadedAd}
              width={effectiveTemplateWidth}
              height={templateHeightDp}
              style={nativeRootDynamicStyle}
              templateStyle={S.templateStyle}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#121821',
    padding: 20,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E8EEF6',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  debug: {
    color: '#9aa4b2',
    fontSize: 12,
    marginBottom: 10,
  },
  info: {
    color: '#bbb',
    marginTop: 20,
    textAlign: 'center',
  },
  adShell: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#0f141c',
    overflow: 'hidden',

    alignItems: 'center',
    justifyContent: 'center',
  },
  templateStyle: {
    backgroundColor: 'rgb(255, 255, 255)',
  },
});
