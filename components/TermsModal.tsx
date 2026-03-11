import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '@/config/theme';

export const TERMS_KEY = '@metalhub_terms_accepted';

export async function hasAcceptedTerms(): Promise<boolean> {
  const val = await AsyncStorage.getItem(TERMS_KEY);
  return val === 'true';
}

export async function setTermsAccepted(): Promise<void> {
  await AsyncStorage.setItem(TERMS_KEY, 'true');
}

interface Props {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function TermsModal({ visible, onAccept, onClose }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.brand}>MetalHub</Text>
          <Text style={styles.title}>Aviso importante – Uso de MetalHub</Text>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.paragraph}>
              MetalHub es una plataforma digital que conecta usuarios para publicar, buscar y concretar ofertas de compra, venta o intercambio dentro del sector del metal.
            </Text>
            <Text style={styles.paragraph}>
              MetalHub no compra ni vende productos, no participa en las transacciones, ni actúa como intermediario en los acuerdos entre usuarios.
            </Text>
            <Text style={styles.paragraph}>
              Todas las operaciones, negociaciones, pagos, entregas o acuerdos realizados entre usuarios son{' '}
              <Text style={styles.highlight}>responsabilidad exclusiva de las partes involucradas.</Text>
            </Text>
            <Text style={styles.paragraph}>
              MetalHub no garantiza la veracidad de los usuarios, productos o{' '}
              <Text style={styles.highlightGold}>información publicada</Text>
              {', '}ni se hace responsable por estafas, fraudes, incumplimientos, daños, pérdidas económicas, conflictos o cualquier incidente derivado de acuerdos realizados dentro o fuera de la plataforma.
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setChecked((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkText}>
              He leído y acepto los{' '}
              <Text style={styles.highlightGold}>Términos y Condiciones</Text>
              {' '}y la{' '}
              <Text style={styles.highlightGold}>Política de Privacidad</Text>
              {' '}de MetalHub.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, !checked && styles.btnDisabled]}
            onPress={onAccept}
            disabled={!checked}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnText, !checked && styles.btnTextDisabled]}>
              Aceptar y continuar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: '#1A1D24',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignSelf: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  brand: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  scroll: {
    maxHeight: 300,
  },
  scrollContent: {
    gap: spacing.sm,
  },
  paragraph: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  highlight: {
    color: colors.danger,
    fontWeight: '600',
  },
  highlightGold: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  checkLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    color: '#0D0D0F',
    fontSize: 15,
    fontWeight: '700',
  },
  btnTextDisabled: {
    color: colors.textMuted,
  },
});
