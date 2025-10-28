import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

type Props = { title: string; onPress: () => void; enabled?: boolean; style?: ViewStyle };

export default function AppButton({ title, onPress, enabled = true, style }: Props) {
  return (
    <Pressable style={[s.btn, !enabled && s.dis, style]} onPress={enabled ? onPress : undefined}>
      <Text style={s.txt}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    marginVertical: 6,
    alignSelf: 'stretch',
  },
  dis: { opacity: 0.5 },
  txt: { color: 'white', fontWeight: '600', textAlign: 'center' },
});
