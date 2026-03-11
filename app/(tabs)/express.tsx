import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ListingCard, ListingCardProps } from '@/components/ListingCard';
import { FilterTabs } from '@/components/FilterTabs';
import { colors, spacing, borderRadius } from '@/config/theme';
import {
  getPublicaciones,
  formatTimeAgo,
  type PublicacionItem,
  formatPrecioSuffix,
  formatUnidadLabel,
} from '@/services/api';

type FilterTab = 'todos' | 'compran' | 'venden';

function mapPublicacionToCard(p: PublicacionItem): ListingCardProps {
  const type = p.tipo === 'compro' ? 'COMPRA' : 'VENTA';
  const quantity = `${Number(p.cantidad).toLocaleString('es-AR')} ${formatUnidadLabel(p.unidad)}`;
  const price = p.precioAConvenir
    ? '$ A convenir'
    : `$${Number(p.precio ?? 0).toLocaleString('es-AR')} /${formatPrecioSuffix(p.unidad)}`;
  return {
    type,
    metal: p.metal,
    quantity,
    price,
    description: p.descripcion ?? '',
    userName: p.usuario?.nombre ?? '',
    rating: String(p.usuario?.rating ?? 0),
    location: p.ubicacion ?? p.usuario?.ubicacion ?? '',
    verified: p.usuario?.verificado ?? false,
    urgent: true,
    timeAgo: formatTimeAgo(p.creadoEn),
    whatsappNumber: p.usuario?.whatsapp,
    avatarUrl: p.usuario?.avatarUrl,
    closed: p.cerrada ?? false,
  };
}

export default function ExpressScreen() {
  const [filter, setFilter] = useState<FilterTab>('todos');
  const [listings, setListings] = useState<PublicacionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactListing, setContactListing] = useState<ListingCardProps | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchListings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!hasLoadedOnce.current) setLoading(true);
    try {
      const tipo = filter === 'todos' ? undefined : filter;
      const res = await getPublicaciones({
        tipo,
        orden: 'reciente',
        urgente: true,
        limite: 50,
      });
      if (res.success && Array.isArray(res.data)) {
        hasLoadedOnce.current = true;
        // Filtro defensivo client-side por si el backend no soporta ?urgente=true
        const urgentes = res.data.filter((p) => p.urgente === true);
        setListings(urgentes);
        setTotal(urgentes.length);
      } else {
        setListings([]);
        setTotal(0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar publicaciones';
      Alert.alert('Error', message);
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useFocusEffect(
    useCallback(() => {
      fetchListings(true);
    }, [fetchListings])
  );

  const handleContactPress = (item: ListingCardProps) => {
    setContactListing(item);
    setContactModalVisible(true);
  };

  const handleConfirmContact = () => {
    if (!contactListing) return;
    const phone = (contactListing.whatsappNumber || '5491112345678').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hola, te hablo desde MetalHub. Me interesa tu publicación: ${contactListing.metal} · ${contactListing.quantity} · ${contactListing.price}`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
    setContactModalVisible(false);
    setContactListing(null);
  };

  const handleCardPress = (pub: PublicacionItem) => {
    router.push({
      pathname: '/publicacion/[id]',
      params: { id: pub.id },
    });
  };

  if (loading && listings.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.danger} />
          <Text style={styles.loadingText}>Cargando express...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <Ionicons name="flash" size={22} color={colors.danger} />
              <Text style={styles.logo}>Express</Text>
            </View>
            <View style={styles.headerBadges}>
              <View style={styles.badgePillRed}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeRedText}>{total} publicaciones urgentes</Text>
              </View>
              <View style={styles.badgePillGray}>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.badgeGrayText}>Expiran en 24h</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoBar}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Publicaciones urgentes con vencimiento en 24 horas.
          </Text>
        </View>

        <View style={styles.filtersSection}>
          <FilterTabs active={filter} onSelect={setFilter} />
        </View>

        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item: pub }) => {
            const card = mapPublicacionToCard(pub);
            return (
              <ListingCard
                {...card}
                onPress={() => handleCardPress(pub)}
                onContact={() => handleContactPress(card)}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchListings(true)}
              tintColor={colors.danger}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="flash-off-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin publicaciones express</Text>
              <Text style={styles.emptySubtitle}>
                Cuando alguien publique con urgencia aparecerá aquí
              </Text>
            </View>
          }
        />
      </View>

      <Modal visible={contactModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.contactModalContent}>
            <Text style={styles.contactModalTitle}>Iniciar negociación</Text>
            <Text style={styles.contactModalBody}>
              Se abrirá un chat privado con {contactListing?.userName ?? ''} vinculado a esta publicación.
            </Text>
            <View style={styles.contactModalActions}>
              <TouchableOpacity
                style={styles.contactModalCancel}
                onPress={() => {
                  setContactModalVisible(false);
                  setContactListing(null);
                }}
              >
                <Text style={styles.contactModalCancelText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactModalConfirm} onPress={handleConfirmContact}>
                <Text style={styles.contactModalConfirmText}>CONTACTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  logo: { fontSize: 20, fontWeight: '700', color: colors.danger },
  headerBadges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  badgePillRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(246,70,93,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  badgeRedText: { color: colors.danger, fontSize: 11, fontWeight: '500' },
  badgePillGray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeGrayText: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(246,70,93,0.08)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  infoText: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  filtersSection: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  listContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  emptyWrap: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  emptySubtitle: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 120, paddingHorizontal: spacing.lg },
  contactModalContent: { backgroundColor: '#fff', marginHorizontal: spacing.lg, marginTop: 200, borderRadius: 12, padding: spacing.lg },
  contactModalTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: spacing.sm },
  contactModalBody: { color: '#333', fontSize: 14, marginBottom: spacing.lg },
  contactModalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
  contactModalCancel: { paddingVertical: spacing.sm },
  contactModalCancelText: { color: colors.info, fontSize: 14, fontWeight: '600' },
  contactModalConfirm: { paddingVertical: spacing.sm },
  contactModalConfirmText: { color: colors.info, fontSize: 14, fontWeight: '600' },
});
