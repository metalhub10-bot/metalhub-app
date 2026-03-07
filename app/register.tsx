import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';
import { registerUser, assertSuccess } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

const COUNTRY_OPTIONS = [
  { code: '+54', label: 'Argentina', flag: '🇦🇷' },
  { code: '+591', label: 'Bolivia', flag: '🇧🇴' },
  { code: '+56', label: 'Chile', flag: '🇨🇱' },
  { code: '+57', label: 'Colombia', flag: '🇨🇴' },
  { code: '+506', label: 'Costa Rica', flag: '🇨🇷' },
  { code: '+53', label: 'Cuba', flag: '🇨🇺' },
  { code: '+1809', label: 'República Dominicana', flag: '🇩🇴' },
  { code: '+593', label: 'Ecuador', flag: '🇪🇨' },
  { code: '+503', label: 'El Salvador', flag: '🇸🇻' },
  { code: '+502', label: 'Guatemala', flag: '🇬🇹' },
  { code: '+504', label: 'Honduras', flag: '🇭🇳' },
  { code: '+52', label: 'México', flag: '🇲🇽' },
  { code: '+505', label: 'Nicaragua', flag: '🇳🇮' },
  { code: '+507', label: 'Panamá', flag: '🇵🇦' },
  { code: '+595', label: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', label: 'Perú', flag: '🇵🇪' },
  { code: '+598', label: 'Uruguay', flag: '🇺🇾' },
  { code: '+58', label: 'Venezuela', flag: '🇻🇪' },
] as const;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+54');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para elegir un avatar.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      if (asset.base64) {
        setAvatarDataUrl(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setAvatarDataUrl(null);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phoneNumber.replace(/\D/g, '');
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedPhone) {
      Alert.alert('Error', 'Completa nombre, email, contraseña y WhatsApp');
      return;
    }
    const fullWhatsapp = `${countryCode}${trimmedPhone}`;
    setLoading(true);
    try {
      const res = await registerUser(
        trimmedEmail,
        trimmedPassword,
        trimmedName,
        avatarDataUrl ?? undefined,
        fullWhatsapp,
      );
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

  const currentCountry = COUNTRY_OPTIONS.find((c) => c.code === countryCode) ?? COUNTRY_OPTIONS[0];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.iconWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar} disabled={loading}>
            <Ionicons name="camera" size={16} color={colors.text} />
            <Text style={styles.avatarButtonText}>
              {avatarUri ? 'Cambiar foto' : 'Subir foto de perfil'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a MetalHub</Text>
          <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} editable={!loading} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!loading} />
          <View style={styles.passwordRow}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput, styles.passwordInputNoBorder]}
                placeholder="Contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textSecondary}
                  style={{ lineHeight: 20, textAlignVertical: 'center' }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryCodeBtn}
              disabled={loading}
              onPress={() => {
                setCountryModalVisible(true);
              }}
            >
              <Text style={styles.countryCodeText}>
                {currentCountry.flag} {currentCountry.code}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="WhatsApp"
              placeholderTextColor={colors.textMuted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
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

      <Modal visible={countryModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.countryModalOverlay}
          activeOpacity={1}
          onPress={() => setCountryModalVisible(false)}
        >
          <View style={styles.countryModalContent}>
            <Text style={styles.countryModalTitle}>Selecciona tu país</Text>
            <FlatList
              data={COUNTRY_OPTIONS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryModalVisible(false);
                  }}
                >
                  <Text style={styles.countryItemText}>
                    {item.flag} {item.label} ({item.code})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.lg },
  iconWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg },
  passwordRow: {
    marginBottom: spacing.md,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    height: 52,
    textAlignVertical: 'center',
    marginBottom: 0,
  },
  passwordInputNoBorder: {
    borderWidth: 0,
    borderRadius: 0,
  },
  passwordToggle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    width: 44,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarButton: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarButtonText: { color: colors.textSecondary, fontSize: 13 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.xl },
  input: { backgroundColor: colors.input, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: 16, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCodeText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm, minHeight: 52, justifyContent: 'center' },
  primaryBtnText: { color: '#0D0D0F', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, paddingBottom: spacing.xl },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '600' },
  countryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  countryModalContent: {
    width: '100%',
    maxHeight: 320,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryModalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  countryItem: {
    paddingVertical: spacing.sm,
  },
  countryItemText: {
    color: colors.text,
    fontSize: 14,
  },
});
