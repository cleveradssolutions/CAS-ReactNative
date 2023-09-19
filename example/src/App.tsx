import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Setup } from './setup.component';
import { Menu } from './menu.component';
import { Banners } from './banners.component';
import { Ads } from './ads.component';
import { Settings } from './settings.component';
import { CasProvider } from './cas.context';
import { LoggerTerminal } from './logger-terminal.component';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <CasProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name={'Setup'} component={Setup} />
            <Stack.Screen name={'Menu'} component={Menu} />
            <Stack.Screen name={'Ads'} component={Ads} />
            <Stack.Screen name={'Banners'} component={Banners} />
            <Stack.Screen name={'Settings'} component={Settings} />
          </Stack.Navigator>
        </NavigationContainer>
        <LoggerTerminal />
      </CasProvider>
    </SafeAreaProvider>
  );
}
