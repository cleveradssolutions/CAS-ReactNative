import React, { ScrollView, View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import { useNavigation } from '@react-navigation/native';

export default function MenuScreen() {
  const nav = useNavigation();
  const go = (name: string) => () => nav.navigate(name as never);

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Examples</Text>
        <Text style={S.subtitle}>Choose an ad format to test</Text>

        <ScrollView contentContainerStyle={S.menuList} showsVerticalScrollIndicator={false} bounces>
          <AppButton title="Interstitial" onPress={go('Interstitial')} />
          <AppButton title="Rewarded" onPress={go('Rewarded')} />
          <AppButton title="App Open" onPress={go('AppOpen')} />

          <View style={S.divider} />
          
          <AppButton title="Native" onPress={go('Native')} />
          <AppButton title="Native Template Size" onPress={go('NativeSizeExample')} />
          

          <View style={S.divider} />

          <AppButton title="Banner (AdView)" onPress={go('Banner')} />
          <AppButton title="MREC (AdView)" onPress={go('MREC')} />
          <AppButton title="Adaptive (AdView)" onPress={go('Adaptive')} />
          <AppButton title="Scrolled AdViews" onPress={go('Scrolled')} />
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
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: '#121821',
    padding: 20,
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
  subtitle: {
    fontSize: 14,
    color: '#A5B3C5',
    textAlign: 'center',
    marginBottom: 16,
  },
  menuList: {
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
    borderRadius: 1,
  },
});
