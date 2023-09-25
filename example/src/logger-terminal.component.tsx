import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCasContext } from './cas.context';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export const LoggerTerminal = () => {
  const [logs, setLogs] = useState<Array<string>>([]);
  const context = useCasContext();
  const ref = useRef<ScrollView | null>(null);

  const logger = useCallback((...data: any[]) => {
    const _data = data.filter((f) => !!f);

    !!_data.length &&
      setLogs((state) => [
        ...state,
        _data
          .map((d) => d.toString())
          .join('')
          .toString(),
      ]);

    setTimeout(() => {
      ref.current?.scrollToEnd();
    }, 200);
  }, []);

  useEffect(() => {
    context.setCasLogger(logger);
  }, [logger, context]);

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={styles.text}>Logger terminal: </Text>
        <Button title={'clear'} onPress={() => setLogs([])} />
      </View>
      <ScrollView ref={ref} contentContainerStyle={styles.scroll}>
        {logs.map((log, i) => (
          <Text key={i} style={styles.text}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'black',
    height: 200,
    padding: 16,
  },
  text: {
    color: 'white',
    marginVertical: 4,
  },
  scroll: {
    paddingTop: 16,
  },
});
