import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';
import { loginUser, setSessionId, assertSuccess } from '@/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Ingresa email y contraseña');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser(trimmedEmail, trimmedPassword);
      assertSuccess(res);
      if (res.sessionId) {
        await setSessionId(res.sessionId);
      }
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.iconWrap}>
          <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
        </View>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta de MetalHub</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0D0D0F" />
          ) : (
            <Text style={styles.primaryBtnText}>Entrar</Text>
          )}
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.replace('/register')} disabled={loading}>
            <Text style={styles.footerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  iconWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  icon: { width: 160, height: 160, borderRadius: 36 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.xl },
  input: { backgroundColor: colors.input, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: 16, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm, minHeight: 52, justifyContent: 'center' },
  primaryBtnText: { color: '#0D0D0F', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingVertical: spacing.lg },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '600' },
});
