import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/config/theme';
import { getSessionId } from '@/services/api';

export default function IndexScreen() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await getSessionId();
        if (cancelled) return;
        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch {
        if (!cancelled) router.replace('/login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
