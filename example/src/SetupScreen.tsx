import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View, Text, StyleSheet } from 'react-native';
import AppButton from './components/AppButton';
import CASMobileAds, { Audience, Gender, PrivacyGeography } from 'react-native-cas';
import { useNavigation } from '@react-navigation/native';

export default function SetupScreen() {
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const inited = await CASMobileAds.isInitialized();
        if (inited) {
          nav.navigate('Menu' as never);
        }
      } catch {}
    })();
  }, [nav]);

  const init = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setStatusText('Initializing…');

    CASMobileAds.setDebugLoggingEnabled(__DEV__); // default false
    CASMobileAds.setUserId('TestUserID'); // optional
    CASMobileAds.setUserAge(18); // optional, for test
    CASMobileAds.setUserGender(Gender.MALE); // optional, for test
    CASMobileAds.setLocationCollectionEnabled(true); // default false
    CASMobileAds.setAdSoundsMuted(false); // default false
    CASMobileAds.setTrialAdFreeInterval(0); // default 0

    const casId = Platform.select({
      android: 'demo',
      ios: 'demo',
    })!;
    const status = await CASMobileAds.initialize(casId, {
      targetAudience: Audience.UNDEFINED, // default UNDEFINED
      showConsentFormIfRequired: true, // default true
      forceTestAds: __DEV__, // default false
      testDeviceIds: [
        // Test Devide ID
      ],
      debugGeography: PrivacyGeography.EUROPEAN_ECONOMIC_AREA,
      mediationExtras: {
        testKey: 'testValue', // optional, just for test
      },
    });

    if (status.error) {
      console.warn('CAS initialization error:', status.error);
      setStatusText(null);
      setError(status.error);
      setLoading(false);
    } else {
      console.log('CAS initialized:', status);
      setStatusText('Initialization complete');
      nav.navigate('Menu' as never);
      setLoading(false);
    }
  }, [loading, nav]);

  return (
    <View style={S.screen}>
      <View style={S.card}>
        <Text style={S.title}>Initialize CAS</Text>
        <Text style={S.subtitle}>One tap to set up SDK & continue</Text>

        <View style={S.stack}>
          <AppButton
            title={loading ? 'Initializing…' : 'Initialize'}
            onPress={init}
            enabled={!loading}
          />

          {loading && (
            <View style={S.rowCenter}>
              <ActivityIndicator />
              <Text style={S.statusText}>{statusText}</Text>
            </View>
          )}

          {!!error && <Text style={S.errorText}>{error}</Text>}
        </View>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 20, android: 12 }),
    paddingBottom: Platform.select({ ios: 24, android: 16 }),
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
  stack: {
    gap: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: 4,
  },
  statusText: {
    color: '#A5B3C5',
    fontSize: 14,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 6,
  },
});
