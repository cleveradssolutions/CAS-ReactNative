import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import AppButton from './components/AppButton';
import { RootStackParamList, ROUTE_TITLES } from './navigation/routes';

type RouteName = keyof RootStackParamList;

export default function MenuScreen() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const go = (name: RouteName) => () => nav.navigate(name);

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Examples</Text>
        <Text style={S.subtitle}>Choose an ad format to test</Text>

        <ScrollView contentContainerStyle={S.menuList} showsVerticalScrollIndicator={false} bounces>
          <AppButton title={ROUTE_TITLES.Interstitial} onPress={go('Interstitial')} />
          <AppButton title={ROUTE_TITLES.Rewarded} onPress={go('Rewarded')} />
          <AppButton title={ROUTE_TITLES.AppOpen} onPress={go('AppOpen')} />

          <View style={S.divider} />

          <AppButton title={ROUTE_TITLES.Native} onPress={go('Native')} />
          <AppButton title={ROUTE_TITLES.NativeSizeExample} onPress={go('NativeSizeExample')} />

          <View style={S.divider} />

          <AppButton title={ROUTE_TITLES.Banner} onPress={go('Banner')} />
          <AppButton title={ROUTE_TITLES.MREC} onPress={go('MREC')} />
          <AppButton title={ROUTE_TITLES.Adaptive} onPress={go('Adaptive')} />
          <AppButton title={ROUTE_TITLES.Scrolled} onPress={go('Scrolled')} />
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
