import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  PixelRatio,
} from 'react-native';

import AppButton from './components/AppButton';

import {
  NativeAdLoader,
  NativeAdView,
  AdChoicesPlacement,
  NativeAdType,
  AdError,
  AdContentInfo,
} from 'react-native-cas';

function pxToDp(px: number) {
  const dp = Math.round(px / PixelRatio.get());
  return Math.max(1, dp);
}

export default function NativeTemplateSizeExample() {
  const { width: winWidth } = useWindowDimensions();

  const [loadedAd, setLoadedAd] = useState<NativeAdType | null>(null);
  const [muted, setMuted] = useState(false);

  const [placement, setPlacement] = useState<AdChoicesPlacement>(
    AdChoicesPlacement.topRightCorner
  );

  const [templateHeightDp] = useState(250);

  const MIN_INLINE_WIDTH = 300;
  const CARD_HORIZONTAL_PADDING = 20 * 2; // card padding
  const AD_SHELL_PADDING = 14 * 2;        // adShell padding

  const cardWidthPx = useMemo(() => {
    return Math.min(winWidth - 40, 420);
  }, [winWidth]);

  const contentWidthPx = useMemo(() => {
    return Math.max(0, Math.round(cardWidthPx - 68));
  }, [cardWidthPx]);
  
  const availableWidth = useMemo(() => {
    const w = cardWidthPx - CARD_HORIZONTAL_PADDING - AD_SHELL_PADDING;
    return w > 0 ? Math.round(w) : 0;
  }, [cardWidthPx]);

  const effectiveTemplateWidth = useMemo(() => {
    if (availableWidth <= 0) return 0;
    return Math.max(availableWidth, MIN_INLINE_WIDTH);
  }, [availableWidth]);

  useEffect(() => {
    const unsubLoaded = NativeAdLoader.addAdLoadedEventListener(
      (ad: NativeAdType) => {
        console.log('Native Ad loaded', ad.instanceId);
        setLoadedAd(ad);
      }
    );

    const unsubFailed = NativeAdLoader.addAdFailedToLoadEventListener(
      (e: AdError) => {
        console.log('Native Ad failed to load', e);
        setLoadedAd(null);
      }
    );

    const unsubClicked = NativeAdLoader.addAdClickedEventListener(() => {
      console.log('Native Ad clicked');
    });

    const unsubImpression = NativeAdLoader.addAdImpressionEventListener(
      (info: AdContentInfo) => {
        console.log('Native Ad impression', info);
      }
    );

    NativeAdLoader.loadAds(1);

    return () => {
      unsubLoaded();
      unsubFailed();
      unsubClicked();
      unsubImpression();

      setLoadedAd(prev => {
        prev?.destroyAd();
        return null;
      });
    };
  }, []);

  const onPressReload = () => {
    NativeAdLoader.loadAds(1);
  };

  const onToggleMute = () => {
    NativeAdLoader.setNativeMutedEnabled(!muted);
    setMuted(!muted);
  };

  const onChangePlacement = () => {
    const next = ((placement as number) + 1) % 4;
    NativeAdLoader.setNativeAdChoicesPlacement(next);
    setPlacement(next as any);
  };

  const cardDynamicStyle = useMemo(() => {
    return { width: cardWidthPx };
  }, [cardWidthPx]);

  return (
    <ScrollView style={S.screen} contentContainerStyle={S.content}>
      <View style={[S.card, cardDynamicStyle]}>
        <Text style={S.title}>Native Template Size</Text>

        <View style={S.row}>
          <AppButton title="Reload" onPress={onPressReload} />
          <AppButton title={muted ? 'Unmute' : 'Mute'} onPress={onToggleMute} />
          <AppButton title="Change AdChoices" onPress={onChangePlacement} />
        </View>

        {!loadedAd ? (
          <Text style={S.info}>Loading native ad...</Text>
        ) : (
          <View style={S.adShell}>
            <NativeAdView
              ad={loadedAd}
              usesTemplate={true}
              width={effectiveTemplateWidth}
              height={templateHeightDp}
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
  },
  templateStyle: {
    backgroundColor: '#8c939eff',
  },
});
