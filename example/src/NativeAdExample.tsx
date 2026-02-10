import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
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
import { ROUTE_TITLES } from './App';

export default function NativeAdExample() {
  const { width: winWidth } = useWindowDimensions();

  const [loadedAd, setLoadedAd] = useState<NativeAdType | null>(null);
  const [muted, setMuted] = useState(false);

  const [placement, setPlacement] = useState<AdChoicesPlacement>(
    AdChoicesPlacement.topRightCorner
  );

  const cardWidth = useMemo(() => Math.min(winWidth - 40, 420), [winWidth]);
  const contentWidth = useMemo(() => Math.max(0, Math.round(cardWidth - 68)), [cardWidth]);

  useEffect(() => {
    const unsubscribeLoaded = NativeAdLoader.addAdLoadedEventListener((ad: NativeAdType) => {
      console.log('Native Ad loaded', ad.instanceId);
      setLoadedAd(ad);
    });

    const unsubscribeLoadFailed = NativeAdLoader.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('Native Ad failed to load', e);
      setLoadedAd(null);
    });

    const unsubscribeClicked = NativeAdLoader.addAdClickedEventListener(() => {
      console.log('Native Ad clicked');
    });

    const unsubscribeImpression = NativeAdLoader.addAdImpressionEventListener((info: AdContentInfo) => {
      console.log('Native Ad impression', info);
    });

    NativeAdLoader.loadAds(1);

    return () => {
      unsubscribeLoaded();
      unsubscribeLoadFailed();
      unsubscribeClicked();
      unsubscribeImpression();

      setLoadedAd(prev => {
        prev?.destroyAd();
        return null;
      });
    };
  }, []);

  const onPressLoadButton = () => {
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

  const cardDynamicStyle = useMemo(() => ({ width: cardWidth }), [cardWidth]);
  const nativeRootDynamicStyle = useMemo(() => ({ width: contentWidth }), [contentWidth]);
  const headlineDynamicStyle = useMemo(() => ({ width: contentWidth }), [contentWidth]);

  const mediaWrapDynamicStyle = useMemo(
    () => ({ width: contentWidth, height: 180 }),
    [contentWidth]
  );

  const ctaDynamicStyle = useMemo(() => ({ width: contentWidth }), [contentWidth]);

  return (
    <ScrollView
      style={S.screen}
      contentContainerStyle={S.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[S.card, cardDynamicStyle]}>
        <Text style={S.title}>{ROUTE_TITLES.Native}</Text>

        <View style={S.row}>
          <AppButton title="Reload" onPress={onPressLoadButton} />
          <AppButton title={muted ? 'Unmute' : 'Mute'} onPress={onToggleMute} />
          <AppButton title="Change AdChoices" onPress={onChangePlacement} />
        </View>

        {!loadedAd ? (
          <Text style={S.info}>Loading native ad...</Text>
        ) : (
          <View style={S.adShell}>
            <NativeAdView
              ad={loadedAd}
              style={[S.nativeRoot, nativeRootDynamicStyle]}
              templateStyle={S.templateStyle}
            >
              {/* AdChoices */}
              <NativeAdView.AdChoices style={S.adChoices} />

              {/* Headline */}
              <NativeAdView.Headline style={[S.headline, headlineDynamicStyle]} />

              {/* Top row */}
              <View style={S.topRow}>
                <View style={S.iconWrap}>
                  <NativeAdView.Icon style={S.icon} />
                </View>

                <View style={S.topMeta}>
                  <NativeAdView.Advertiser style={S.advertiser} />

                  <View style={S.rateRow}>
                    <NativeAdView.StarRating style={S.stars} />
                    <NativeAdView.ReviewCount style={S.reviewCount} />
                  </View>
                </View>
              </View>

              {/* AD LABEL */}
              <NativeAdView.AdLabel style={S.adLabel} />

              {/* MEDIA */}
              <View style={[S.mediaWrap, mediaWrapDynamicStyle]}>
                <NativeAdView.Media style={S.media} />
              </View>

              {/* BODY */}
              <NativeAdView.Body style={S.body} />

              {/* STORE AND PRICE */}
              <View style={S.metaRow}>
                <NativeAdView.Price style={S.price} />
                <NativeAdView.Store style={S.store} />
              </View>

              {/* CALL TO ACTION */}
              <NativeAdView.CallToAction style={[S.cta, ctaDynamicStyle]} />
            </NativeAdView>
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
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
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

  row: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 8,
  },

  info: {
    color: '#A5B3C5',
    marginTop: 20,
    textAlign: 'center',
  },

  adShell: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#0f141c',
    overflow: 'hidden',
  },

  nativeRoot: {},

  templateStyle: {
    backgroundColor: '#FFFFFF',
  },

  adChoices: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
  },

  headline: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    paddingRight: 30,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9', 
  },

  icon: {
    width: 52,
    height: 52,
  },

  topMeta: {
    flex: 1,
  },

  advertiser: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB', 
    marginBottom: 4,
  },

  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stars: {
    width: 88,
    height: 14,
    marginRight: 8,
  },

  reviewCount: {
    fontSize: 11,
    color: '#475569', 
    opacity: 0.95,
  },

  adLabel: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderColor: '#2563EB',
    borderWidth: 1,
    color: '#2563EB',
    fontSize: 12,
    borderRadius: 999,
  },

  mediaWrap: {
    marginTop: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },

  media: {
    width: '100%',
    height: '100%',
  },

  body: {
    marginTop: 10,
    fontSize: 13,
    color: '#334155', 
    opacity: 1,
    lineHeight: 18,
  },

  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  price: {
    fontSize: 12,
    color: '#0F172A',
    marginRight: 10,
    fontWeight: '700',
  },

  store: {
    fontSize: 12,
    color: '#475569',
    opacity: 1,
    flex: 1,
  },

  cta: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: '800',
    overflow: 'hidden',
  },
});
