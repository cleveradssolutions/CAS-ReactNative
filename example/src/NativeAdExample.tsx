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
    NativeAdLoader.loadAds(1);
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
              backgroundColor: '#8c939eff',              
            }}
        >
          
        {/* HEADLINE */}
        <NativeAdView.Headline
          style={{
            width: '100%',
            height: 48,
            fontSize: 24,
            fontWeight: '700',
            color: '#222222',
            marginBottom: 6,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* ICON */}
          <NativeAdView.Icon
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              marginRight: 8,
            }}
          />

          <View style={{ flex: 1 }}>
            {/* ADVERTISER */}
            <NativeAdView.Advertiser
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#333333',
              }}
            />

            {/* STAR RATING */}
            <NativeAdView.StarRating
              style={{
                width: 80,
                height: 12,
                marginTop: 2,
              }}
            />

            {/* REVIEW COUNT */}
            <NativeAdView.ReviewCount
              style={{
                fontSize: 10,
                color: '#777777',
              }}
            />
          </View>
        </View>

        {/* AD CHOICES */}
        <NativeAdView.AdChoices
          style={{
            position: 'absolute',                        
            width: 10,
            height: 10,
          }}
        />

        {/* AD LABEL */}
        <NativeAdView.AdLabel
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: '#eeeeee',
            color: '#666666',
            fontSize: 17,
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        
        {/* MEDIA */}
        <NativeAdView.Media
          style={{
            width: '100%',
            height: 180,
            borderRadius: 12,            
            overflow: 'hidden',            
          }}
        />

        {/* BODY */}
        <NativeAdView.Body
          style={{
            fontSize: 13,
            color: '#444444',
            marginVertical: 6,
          }}
        />

        {/* PRICE */}
        <NativeAdView.Price
          style={{
            fontSize: 12,
            color: '#008800',
            marginBottom: 2,
          }}
        />

        {/* STORE */}
        <NativeAdView.Store
          style={{
            fontSize: 11,
            color: '#666666',
            marginBottom: 8,
          }}
        />

        {/* CALL TO ACTION */}
        <NativeAdView.CallToAction
          style={{
            backgroundColor: '#ff6600',
            color: '#ffffff',
            paddingVertical: 10,
            borderRadius: 8,
            textAlign: 'center',
            fontWeight: '600',
          }}
        />
          
        </NativeAdView>
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