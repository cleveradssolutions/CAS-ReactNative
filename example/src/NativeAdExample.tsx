import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import { NativeAd, type AdError, type AdContentInfo, NativeAdView, AdChoicesPlacement } from 'react-native-cas';

export default function NativeAdExample() {
  const [loaded, setLoaded] = useState(false);  
  const [muted, setMuted] = useState(false);
  const [placement, setPlacement] = useState(AdChoicesPlacement.topRightCorner);

  useEffect(() => {
    const unsubscribeLoaded = NativeAd.addAdLoadedEventListener(() => {
      console.log('Native Ad loaded');
      setLoaded(true);      
    });

    const unsubscribeLoadFailed = NativeAd.addAdFailedToLoadEventListener((e: AdError) => {
      console.log('Native Ad failed to load', e);
      setLoaded(false);      
    });

    const unsubscribeClicked = NativeAd.addAdClickedEventListener(() => {
      console.log('Native Ad clicked');
    });

    const unsubscribeImpression = NativeAd.addAdImpressionEventListener((info: AdContentInfo) => {
      console.log('Native Ad impression', info);
    });        

    NativeAd.loadAd();

    return () => {
      unsubscribeLoaded();
      unsubscribeLoadFailed();
      unsubscribeClicked();
      unsubscribeImpression();      

      NativeAd.destroyAd();
    };
  }, []);

  const onPressLoadButton = () => {
    NativeAd.loadAd();
  };

  const onToggleMute = () => {
    NativeAd.setNativeMutedEnabled(!muted);
    setMuted(!muted);
  };

  const onChangePlacement = () => {
    const next = (placement + 1) % 4;
    NativeAd.setNativeAdChoisesPlacement(next);
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
        {loaded ? (
          <NativeAdView
            width={320}
            height={320}            
            templateStyle={{
              backgroundColor: '#ffffffff',
              primaryColor: '#ff0000ff',
              primaryTextColor: '#0066FF',
              headlineTextColor: '#84ff00ff',
              headlineFontStyle: 'bold',
              secondaryTextColor: '#cccccc',
              secondaryFontStyle: 'medium', // normal | bold | italic | monospace
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
