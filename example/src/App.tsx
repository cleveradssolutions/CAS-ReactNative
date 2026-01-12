import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetupScreen from './SetupScreen';
import MenuScreen from './MenuScreen';

import InterstitialExample from './InterstitialExample';
import RewardedExample from './RewardedExample';
import AppOpenExample from './AppOpenExample';

import NativeAdExample from './NativeAdExample';

import NativeBannerExample from './BannerExample';
import NativeMRecExample from './MRecExample';
import AdaptiveBannerExample from './AdaptiveBannerExample';
import ScrolledAdViewExample from './ScrolledAdViewExample';
import NativeTemplateSizeExample from './NativeTemplateSizeExample';

export type RootStackParamList = {
  Setup: undefined;
  Menu: undefined;
  Interstitial: undefined;
  Rewarded: undefined;
  AppOpen: undefined;
  Native: undefined;
  NativeSizeExample: undefined;
  Banner: undefined;
  MREC: undefined;
  Adaptive: undefined;
  Scrolled: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Setup">
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />

        <Stack.Screen name="Interstitial" component={InterstitialExample} />
        <Stack.Screen name="Rewarded" component={RewardedExample} />
        <Stack.Screen name="AppOpen" component={AppOpenExample} />

        <Stack.Screen name="Native" component={NativeAdExample} />
        <Stack.Screen name="NativeSizeExample" component={NativeTemplateSizeExample} />

        <Stack.Screen name="Banner" component={NativeBannerExample} />
        <Stack.Screen name="MREC" component={NativeMRecExample} />
        <Stack.Screen name="Adaptive" component={AdaptiveBannerExample} />
        <Stack.Screen name="Scrolled" component={ScrolledAdViewExample} />        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
