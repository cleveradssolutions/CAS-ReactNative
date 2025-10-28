import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BannerAdViewRef } from 'react-native-cas';
import { BannerAdView, BannerAdSize } from 'react-native-cas';

const TXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

function InlineBannerAd() {
  const adRef = useRef<BannerAdViewRef>(null);
  const [width, setWidth] = useState<number>(0);

  const onViewLayout = (event: LayoutChangeEvent) => {
    const newWidth = event.nativeEvent.layout.width;
    setWidth(newWidth);
  };

  return (
    <View style={S.slot} onLayout={onViewLayout}>
      {width > 0 && (
        // Wait Width from handleLayout to start load ad
        <BannerAdView
          ref={adRef}
          size={BannerAdSize.INLINE}
          // The Inline size has the width and height of the screen.
          // You can limit it by specifying a maxWidth and maxHeight.
          maxWidth={width}
          maxHeight={280}
          autoReload={true} // Use auto reload after errors
          refreshInterval={0} // Disable refresh ad content
        />
      )}
    </View>
  );
}

export default function ScrolledAdViewExample() {
  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Scrolled AdViews</Text>
        <Text style={S.subtitle}>Inline banner & MREC inside scroll</Text>

        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
          <Text key={`t-1`} style={S.p}>
            {TXT}
          </Text>
          <InlineBannerAd key={`b-1`} />
          <Text key={`t-2`} style={S.p}>
            {TXT}
          </Text>
          <InlineBannerAd key={`b-2`} />
          <Text key={`t-3`} style={S.p}>
            {TXT}
          </Text>
        </ScrollView>
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
    borderRadius: 16,
    backgroundColor: '#121821',
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8EEF6',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: { fontSize: 14, color: '#A5B3C5', textAlign: 'center', marginBottom: 16 },
  stack: { gap: 12 },
  p: { margin: 8, fontSize: 16, color: '#E8EEF6', marginBottom: 10 },
  slot: { width: '100%', marginBottom: 10 },
  center: { alignItems: 'center' },
});
