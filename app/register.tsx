import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';
import { registerUser, assertSuccess } from '@/services/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Completa nombre, email y contraseña');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(trimmedEmail, trimmedPassword, trimmedName);
      assertSuccess(res);
      Alert.alert('Cuenta creada', 'Ya puedes iniciar sesión.', [
        { text: 'Entrar', onPress: () => router.replace('/login') },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo registrar';
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a MetalHub</Text>
          <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} editable={!loading} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!loading} />
          <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry editable={!loading} />
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#0D0D0F" /> : <Text style={styles.primaryBtnText}>Registrarme</Text>}
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')} disabled={loading}>
              <Text style={styles.footerLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.md },
  iconWrap: { alignItems: 'center', marginBottom: spacing.xl },
  icon: { width: 120, height: 120, borderRadius: 28 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.xl },
  input: { backgroundColor: colors.input, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: 16, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm, minHeight: 52, justifyContent: 'center' },
  primaryBtnText: { color: '#0D0D0F', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, paddingBottom: spacing.xl },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '600' },
});
