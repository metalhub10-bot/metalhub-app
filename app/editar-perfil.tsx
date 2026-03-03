import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, borderRadius } from '@/config/theme';
import { getMe, updateMe, assertSuccess } from '@/services/api';
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

export default function EditarPerfilScreen() {
  const [nombre, setNombre] = useState('');
  const [bio, setBio] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+54');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        if (res.success && res.user) {
          const u = res.user as { nombre?: string; bio?: string; ubicacion?: string; avatarUrl?: string; whatsapp?: string };
          setNombre(u.nombre ?? '');
          setBio(u.bio ?? '');
          setUbicacion(u.ubicacion ?? '');
          if (u.avatarUrl) {
            setAvatarUrl(u.avatarUrl);
          }
          if (u.whatsapp) {
            const raw = String(u.whatsapp);
            const match = COUNTRY_OPTIONS.find((c) => raw.startsWith(c.code));
            if (match) {
              setCountryCode(match.code);
              setPhoneNumber(raw.slice(match.code.length));
            } else {
              setPhoneNumber(raw);
            }
          }
        } else if ((res as { message?: string }).message) {
          Alert.alert('Error', (res as { message?: string }).message ?? 'No se pudo cargar el perfil');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo cargar el perfil';
        Alert.alert('Error', msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      setAvatarUrl(asset.uri);
      if (asset.base64) {
        setAvatarDataUrl(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setAvatarDataUrl(null);
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir la galería.');
    }
  };

  const handleSave = async () => {
    const trimmedNombre = nombre.trim();
    if (!trimmedNombre) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }
    setSaving(true);
    try {
      const trimmedPhone = phoneNumber.replace(/\D/g, '');
      const fullWhatsapp = trimmedPhone ? `${countryCode}${trimmedPhone}` : undefined;
      const res = await updateMe({
        nombre: trimmedNombre,
        bio: bio.trim() || undefined,
        ubicacion: ubicacion.trim() || undefined,
        avatarUrl: avatarDataUrl ?? undefined,
        whatsapp: fullWhatsapp,
      });
      assertSuccess(res);
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el perfil';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentCountry = COUNTRY_OPTIONS.find((c) => c.code === countryCode) ?? COUNTRY_OPTIONS[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handlePickAvatar}
            disabled={saving}
          >
            <Ionicons name="camera" size={16} color={colors.text} />
            <Text style={styles.avatarButtonText}>
              {avatarUrl ? 'Cambiar foto' : 'Subir foto de perfil'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          editable={!saving}
        />

        <Text style={styles.label}>UBICACIÓN</Text>
        <TextInput
          style={styles.input}
          value={ubicacion}
          onChangeText={setUbicacion}
          placeholder="Ciudad, provincia"
          placeholderTextColor={colors.textMuted}
          editable={!saving}
        />

        <Text style={styles.label}>WHATSAPP</Text>
        <View style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.countryCodeBtn}
            disabled={saving}
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
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Número de WhatsApp"
            placeholderTextColor={colors.textMuted}
            editable={!saving}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>BIO (OPCIONAL)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={bio}
          onChangeText={setBio}
          placeholder="Contá brevemente a qué te dedicás..."
          placeholderTextColor={colors.textMuted}
          editable={!saving}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#0D0D0F" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
  content: { padding: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary },
  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cardElevated,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
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
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#0D0D0F',
    fontSize: 16,
    fontWeight: '700',
  },
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

