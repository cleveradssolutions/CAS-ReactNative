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
import { RootStackParamList, ROUTE_TITLES } from './navigation/routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Setup">
        <Stack.Screen
          name="Setup"
          component={SetupScreen}
          options={{ title: ROUTE_TITLES.Setup }}
        />

        <Stack.Screen name="Menu" component={MenuScreen} options={{ title: ROUTE_TITLES.Menu }} />

        <Stack.Screen
          name="Interstitial"
          component={InterstitialExample}
          options={{ title: ROUTE_TITLES.Interstitial }}
        />

        <Stack.Screen
          name="Rewarded"
          component={RewardedExample}
          options={{ title: ROUTE_TITLES.Rewarded }}
        />

        <Stack.Screen
          name="AppOpen"
          component={AppOpenExample}
          options={{ title: ROUTE_TITLES.AppOpen }}
        />

        <Stack.Screen
          name="Native"
          component={NativeAdExample}
          options={{ title: ROUTE_TITLES.Native }}
        />

        <Stack.Screen
          name="NativeSizeExample"
          component={NativeTemplateSizeExample}
          options={{ title: ROUTE_TITLES.NativeSizeExample }}
        />

        <Stack.Screen
          name="Banner"
          component={NativeBannerExample}
          options={{ title: ROUTE_TITLES.Banner }}
        />

        <Stack.Screen
          name="MREC"
          component={NativeMRecExample}
          options={{ title: ROUTE_TITLES.MREC }}
        />

        <Stack.Screen
          name="Adaptive"
          component={AdaptiveBannerExample}
          options={{ title: ROUTE_TITLES.Adaptive }}
        />

        <Stack.Screen
          name="Scrolled"
          component={ScrolledAdViewExample}
          options={{ title: ROUTE_TITLES.Scrolled }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
