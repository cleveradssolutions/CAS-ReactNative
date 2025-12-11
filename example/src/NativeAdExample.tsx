import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import { NativeAdLoader, NativeAdView, AdChoicesPlacement, NativeAdViewRef, NativeAdType, AdError, AdContentInfo } from 'react-native-cas';

export default function NativeAdExample() {
  const [loadedAd, setLoadedAd] = useState<NativeAdType | null>(null);
  const [muted, setMuted] = useState(false);
  const [placement, setPlacement] = useState<AdChoicesPlacement>(AdChoicesPlacement.topRightCorner);

  const nativeRef = useRef<NativeAdViewRef>(null);

  useEffect(() => {    
    // Events
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
    
    // Auto Load
    NativeAdLoader.loadAds(1);

    return () => {
      unsubscribeLoaded();
      unsubscribeLoadFailed();
      unsubscribeClicked();
      unsubscribeImpression();

      if (loadedAd) {
        loadedAd.destroyAd();        
      }
    };
  }, []);

  // Buttons
  const onPressLoadButton = () => {
    NativeAdLoader.loadAd(1);
  };

  const onToggleMute = () => {
    NativeAdLoader.setNativeMutedEnabled(!muted);
    setMuted(!muted);
  };

  const onChangePlacement = () => {
    const next = (placement + 1) % 4;
    NativeAdLoader.setNativeAdChoicesPlacement(next);
    setPlacement(next);
  };

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Native Ad</Text>

        <View style={S.row}>
          <AppButton title="Reload" onPress={onPressLoadButton} />
          <AppButton title={muted ? 'Unmute' : 'Mute'} onPress={onToggleMute} />
          <AppButton title="Change AdChoices" onPress={onChangePlacement} />
        </View>

        {loadedAd ? (
          <NativeAdView
            ref={nativeRef}
            ad={loadedAd}
            width={320}
            height={320}
            templateStyle = {{
            backgroundColor: '#ffffffff',
            primaryColor: '#ff0000ff',
            primaryTextColor:'#0066FF',
            headlineTextColor:'#84ff00ff',
            headlineFontStyle:'bold',
            secondaryTextColor:'#cccccc',
            secondaryFontStyle:'medium' // normal | bold | italic | monospace            
            }}
          />
        ) : (
          <Text style={S.info}>Loading native ad...</Text>
        )}
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
  info: {
    color: '#bbb',
    marginTop: 20,
  },
});
