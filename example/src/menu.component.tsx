import { Button } from 'react-native';
import { styles } from './styles';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Menu = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.screen}>
      <Button
        title={'Ads'}
        onPress={() => navigation.navigate('Ads' as never)}
      />
      <Button
        title={'Banners'}
        onPress={() => navigation.navigate('Banners' as never)}
      />
      <Button
        title={'Settings'}
        onPress={() => navigation.navigate('Settings' as never)}
      />
    </SafeAreaView>
  );
};
