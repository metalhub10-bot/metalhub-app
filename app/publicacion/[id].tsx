import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';
import { getPublicacionById, formatTimeAgo } from '@/services/api';

export default function PublicacionDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    tipo: string;
    metal: string;
    cantidad: number;
    unidad: string;
    precio?: number;
    precioAConvenir: boolean;
    descripcion?: string;
    entrega?: string;
    ubicacion?: string;
    usuario?: { nombre: string; rating?: number; ubicacion?: string; verificado?: boolean; whatsapp?: string };
    urgente?: boolean;
    creadoEn: string;
  } | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID no válido');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicacionById(id);
        if (!res.success || !res.data) {
          setError(res.message ?? res.error ?? 'Publicación no encontrada');
          return;
        }
        if (!cancelled) setData(res.data as typeof data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const type = data?.tipo === 'compro' ? 'COMPRA' : 'VENTA';
  const quantity = data ? `${Number(data.cantidad).toLocaleString('es-AR')} ${data.unidad}` : '';
  const price = data
    ? data.precioAConvenir
      ? '$ A convenir'
      : `$${Number(data.precio ?? 0).toLocaleString('es-AR')} /${data.unidad === 'tn' ? 'tn' : 'kg'}`
    : '';
  const isVerified = data?.usuario?.verificado ?? false;
  const isUrgent = data?.urgente ?? false;
  const timeAgo = data?.creadoEn ? formatTimeAgo(data.creadoEn) : '';

  const handleContact = () => {
    const phone = (data?.usuario?.whatsapp || '5491112345678').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hola, me interesa tu publicación: ${data?.metal ?? ''} · ${quantity} - ${price}`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error ?? 'No encontrado'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de publicación</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgesRow}>
          <View style={[styles.badge, type === 'COMPRA' ? styles.badgeCompra : styles.badgeVenta]}>
            <Text style={styles.badgeText}>{type}</Text>
          </View>
          {isUrgent && (
            <View style={styles.badgeUrgent}>
              <Ionicons name="flash" size={12} color={colors.primary} />
              <Text style={styles.badgeUrgentText}>Urgente</Text>
            </View>
          )}
          {timeAgo ? <Text style={styles.timeAgo}>{timeAgo}</Text> : null}
        </View>

        <Text style={styles.metalQuantity}>{data.metal} · {quantity}</Text>
        <Text style={styles.price}>{price}</Text>

        {data.descripcion ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descripción</Text>
            <Text style={styles.description}>{data.descripcion}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Publicado por</Text>
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{data.usuario?.nombre ?? 'Usuario'}</Text>
                {isVerified && <Ionicons name="checkmark-circle" size={18} color={colors.info} />}
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={14} color={colors.primary} />
                <Text style={styles.metaText}>{String(data.usuario?.rating ?? 0)}</Text>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{data.usuario?.ubicacion ?? data.ubicacion ?? '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.contactButton} onPress={handleContact} activeOpacity={0.8}>
          <Ionicons name="chatbubble" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contactar por WhatsApp</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  headerPlaceholder: { width: 32 },
  container: { flex: 1 },
  content: { padding: spacing.md },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  retryBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.md },
  retryBtnText: { color: colors.text, fontWeight: '600' },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  badgeCompra: { backgroundColor: colors.success },
  badgeVenta: { backgroundColor: colors.danger },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  badgeUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(240,185,11,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeUrgentText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  timeAgo: { color: colors.textSecondary, fontSize: 13 },
  metalQuantity: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  price: { color: colors.text, fontSize: 18, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: spacing.sm },
  description: { color: colors.text, fontSize: 15, lineHeight: 22 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.borderLight, marginRight: spacing.md },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { color: colors.textSecondary, fontSize: 14 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  contactButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
