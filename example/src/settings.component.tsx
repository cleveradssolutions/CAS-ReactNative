import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { Button } from 'react-native';
import { useCasContext } from './cas.context';
import { Audience, CAS, Gender } from 'react-native-cas';

export const Settings = () => {
  const context = useCasContext();

  const getSettings = useCallback(async () => {
    const params = await CAS.getSettings();
    const targetings = await CAS.getTargetingOptions();

    context.logCasInfo('Current CAS settings:', JSON.stringify(params));
    context.logCasInfo(
      'Current Targeting settings:',
      JSON.stringify(targetings)
    );
  }, [context]);

  const setSettings = useCallback(async () => {
    await CAS.setSettings({
      taggedAudience: Audience.Children,
    });

    await CAS.setTargetingOptions({
      gender: Gender.Male,
      age: 12,
    });

    await getSettings();
  }, [getSettings]);

  const setAudienceNetworkDataProcessingOptions = useCallback(async () => {
    const params = {
      state: 1,
      options: ['LDU'],
      country: 1000,
    };

    await CAS.setAudienceNetworkDataProcessingOptions(params);

    context.logCasInfo(
      'Set AudienceNetworkDataProcessingOptions (Facebook):',
      JSON.stringify(params)
    );
  }, [context]);

  const setGoogleAdsConsentForCookies = useCallback(async () => {
    await CAS.setGoogleAdsConsentForCookies(true);

    context.logCasInfo('Set ConsentForCookies (Google): true');
  }, [context]);

  return (
    <SafeAreaView style={styles.screen}>
      <Button title={'Get settings'} onPress={getSettings} />
      <Button
        title={
          'Change settings (taggedAudience to Children, age to 12, gender to Male)'
        }
        onPress={setSettings}
      />
      <Button
        title={'Set AudienceNetworkDataProcessingOptions (Facebook)'}
        onPress={setAudienceNetworkDataProcessingOptions}
      />
      <Button
        title={'Set ConsentForCookies (Google)'}
        onPress={setGoogleAdsConsentForCookies}
      />
    </SafeAreaView>
  );
};
