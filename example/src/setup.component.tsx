import React, { useCallback } from 'react';
import { AdType, CAS } from 'react-native-cas';
import { useCasContext } from './cas.context';
import { Button, Platform } from 'react-native';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Setup = () => {
  const context = useCasContext();
  const navigation = useNavigation();

  const initCas = useCallback(async () => {
    await CAS.debugValidateIntegration();

    const { manager, result } = await CAS.buildManager(
      {
        consentFlow: {
          enabled: true,
          requestATT: true,
        },
        testMode: true,
        userId: 'user_id',
        adTypes: [
          AdType.Interstitial,
          AdType.Banner,
          AdType.Rewarded,
          AdType.AppOpen,
        ],
        casId: Platform.OS === 'ios' ? '1058803540' : undefined,
      },
      (params) => {
        context.logCasInfo(
          'Consent flow was released with status: ',
          params.status
        );
      }
    );

    context.setManager(manager);
    context.logCasInfo(
      'Manager was initialized with result: ',
      JSON.stringify(result)
    );
    navigation.navigate('Menu' as never);
  }, [context, navigation]);

  const showFlow = useCallback(() => {
    return CAS.showConsentFlow(
      {
        requestATT: true,
      },
      (params) => {
        context.logCasInfo(
          'Consent flow was released with status: ',
          params.status
        );
      }
    );
  }, [context]);

  return (
    <SafeAreaView style={styles.screen}>
      <Button title={'Initialize CAS'} onPress={initCas} />
      <Button title={'Show Consent Flow'} onPress={showFlow} />
    </SafeAreaView>
  );
};
