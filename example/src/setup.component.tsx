import React, { useCallback } from 'react';
import { AdType, CAS } from 'react-native-cas';
import { useCasContext } from './cas.context';
import { Button } from 'react-native';
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
        },
        testMode: false,
        userId: 'user_id',
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

  return (
    <SafeAreaView style={styles.screen}>
      <Button title={'Initialize CAS'} onPress={initCas} />
    </SafeAreaView>
  );
};
