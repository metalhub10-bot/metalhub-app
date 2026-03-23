import React, { useState, useCallback, useEffect, useRef } from "react";
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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ListingCard, ListingCardProps } from "@/components/ListingCard";
import { FilterTabs } from "@/components/FilterTabs";
import { SearchBar } from "@/components/SearchBar";
import { colors, spacing, borderRadius } from "@/config/theme";
import { SORT_OPTIONS, METAL_GROUPS } from "@/config/constants";
import {
  getPublicaciones,
  formatTimeAgo,
  type PublicacionItem,
} from "@/services/api";

type FilterTab = "todos" | "compran" | "venden";

function mapPublicacionToCard(p: PublicacionItem): ListingCardProps {
  const type = p.tipo === "compro" ? "COMPRA" : "VENTA";
  const quantity = `${Number(p.cantidad).toLocaleString("es-AR")} ${p.unidad}`;
  const price = p.precioAConvenir
    ? "$ A convenir"
    : `$${Number(p.precio ?? 0).toLocaleString("es-AR")} /${p.unidad === "tn" ? "tn" : "kg"}`;
  return {
    type,
    metal: p.metal,
    quantity,
    price,
    description: p.descripcion ?? "",
    userName: p.usuario?.nombre ?? "",
    rating: String(p.usuario?.rating ?? 0),
    location: p.ubicacion ?? p.usuario?.ubicacion ?? "",
    verified: p.usuario?.verificado ?? false,
    urgent: p.urgente ?? false,
    timeAgo: formatTimeAgo(p.creadoEn),
    whatsappNumber: p.usuario?.whatsapp,
    avatarUrl: p.usuario?.avatarUrl,
    closed: p.cerrada ?? false,
  };
}

const SEARCH_DEBOUNCE_MS = 400;

export default function MercadoScreen() {
  const [filter, setFilter] = useState<FilterTab>("todos");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [sortId, setSortId] = useState("recent");
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactListing, setContactListing] = useState<ListingCardProps | null>(
    null,
  );
  const [listings, setListings] = useState<PublicacionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metalCategoryFilter, setMetalCategoryFilter] = useState<string | null>(
    null,
  );
  const [metalSubtypeFilter, setMetalSubtypeFilter] = useState<string | null>(
    null,
  );
  const [locationFilter, setLocationFilter] = useState("");
  const [metalOtherFilter, setMetalOtherFilter] = useState("");
  const [tempMetalCategoryFilter, setTempMetalCategoryFilter] = useState<
    string | null
  >(null);
  const [tempMetalSubtypeFilter, setTempMetalSubtypeFilter] = useState<
    string | null
  >(null);
  const [tempMetalOtherText, setTempMetalOtherText] = useState("");
  const [tempLocationFilter, setTempLocationFilter] = useState("");
  const hasLoadedOnce = useRef(false);

  const ordenMap: Record<
    string,
    "reciente" | "precio_asc" | "precio_desc" | "volumen"
  > = {
    recent: "reciente",
    price_asc: "precio_asc",
    price_desc: "precio_desc",
    volume: "volumen",
    reputation: "reciente",
  };

  // Debounce búsqueda: solo actualizar después de que el usuario deje de escribir
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const fetchListings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else if (!hasLoadedOnce.current) setLoading(true);
      try {
        const tipo = filter === "todos" ? undefined : filter;

        let metalQuery: string | undefined;
        if (metalCategoryFilter === "otro") {
          metalQuery = metalOtherFilter.trim() || undefined;
        } else if (metalCategoryFilter) {
          const group = METAL_GROUPS.find((g) => g.id === metalCategoryFilter);
          if (group) {
            if (
              group.variants &&
              group.variants.length > 0 &&
              metalSubtypeFilter
            ) {
              metalQuery = `${group.label} - ${metalSubtypeFilter}`;
            } else {
              metalQuery = group.label;
            }
          }
        }
        const res = await getPublicaciones({
          tipo,
          orden: ordenMap[sortId] ?? "reciente",
          busqueda: debouncedSearch.trim() || undefined,
          metal: metalQuery,
          ubicacion: locationFilter.trim() || undefined,
          limite: 50,
        });
        if (res.success && Array.isArray(res.data)) {
          hasLoadedOnce.current = true;
          setListings(res.data);
          setTotal(res.total ?? res.data.length);
        } else {
          setListings([]);
          setTotal(0);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar publicaciones";
        Alert.alert("Error", message);
        setListings([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      filter,
      sortId,
      debouncedSearch,
      metalCategoryFilter,
      metalSubtypeFilter,
      metalOtherFilter,
      locationFilter,
    ],
  );

  // Cargar al montar y cuando cambian filtros/búsqueda (debounced)
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);


  // Refrescar cada vez que la pestaña vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      fetchListings(true);
    }, [fetchListings]),
  );

  const sortLabel =
    SORT_OPTIONS.find((s) => s.id === sortId)?.label ?? "Más reciente";

  const connectedCount = React.useMemo(() => {
    const ids = new Set<string>();
    for (const pub of listings) {
      const id = pub.usuario?.id;
      if (id) ids.add(id);
    }
    return ids.size;
  }, [listings]);

  const handleContactPress = (item: ListingCardProps) => {
    setContactListing(item);
    setContactModalVisible(true);
  };

  const handleConfirmContact = () => {
    if (!contactListing) return;
    const phone = (contactListing.whatsappNumber || "5491112345678").replace(
      /\D/g,
      "",
    );
    const text = encodeURIComponent(
      `Hola, te hablo desde MetalHub. Me interesa tu publicación: ${contactListing.metal} · ${contactListing.quantity} · ${contactListing.price}`,
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
    setContactModalVisible(false);
    setContactListing(null);
  };

  const handleCardPress = (item: ListingCardProps, pub: PublicacionItem) => {
    router.push({
      pathname: "/publicacion/[id]",
      params: { id: pub.id },
    });
  };

  if (loading && listings.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando ofertas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>MetalHub</Text>
            <View style={styles.headerBadges}>
              <View style={styles.badgePillGreen}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeGreenText}>
                  {connectedCount} conectados
                </Text>
              </View>
              <View style={styles.badgePillYellow}>
                <Ionicons name="pulse" size={12} color={colors.primary} />
                <Text style={styles.badgeYellowText}>
                  {total} ofertas activas
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                setTempMetalCategoryFilter(metalCategoryFilter);
                setTempMetalSubtypeFilter(metalSubtypeFilter);
                setTempMetalOtherText(metalOtherFilter);
                setTempLocationFilter(locationFilter);
                setFiltersModalVisible(true);
              }}
            >
              <Ionicons name="options" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchBar value={search} onChangeText={setSearch} />

        <View style={styles.filtersSection}>
          <FilterTabs active={filter} onSelect={setFilter} />
        </View>

        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Ordenar por</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.sortButtonText}>{sortLabel}</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item: pub }) => {
            const card = mapPublicacionToCard(pub);
            return (
              <ListingCard
                {...card}
                onPress={() => handleCardPress(card, pub)}
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
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No hay publicaciones</Text>
            </View>
          }
        />
      </View>

      <Modal visible={sortModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.sortOption,
                  sortId === opt.id && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSortId(opt.id);
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortId === opt.id && styles.sortOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={filtersModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFiltersModalVisible(false)}
        >
          <View style={styles.filtersModalContent}>
            <Text style={styles.filtersTitle}>Filtros</Text>
            <Text style={styles.filtersLabel}>Metal</Text>
            <View style={styles.filtersMetalGrid}>
              {METAL_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.filtersMetalChip,
                    tempMetalCategoryFilter === group.id &&
                      styles.filtersMetalChipActive,
                  ]}
                  onPress={() => {
                    setTempMetalCategoryFilter((current) =>
                      current === group.id ? null : group.id,
                    );
                    // Si cambiamos de grupo, reseteamos subtipo temp
                    setTempMetalSubtypeFilter(null);
                  }}
                >
                  <Text
                    style={[
                      styles.filtersMetalChipText,
                      tempMetalCategoryFilter === group.id &&
                        styles.filtersMetalChipTextActive,
                    ]}
                  >
                    {group.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {tempMetalCategoryFilter === "otro" ? (
              <>
                <Text style={styles.filtersLabel}>¿Qué material buscas?</Text>
                <TextInput
                  style={styles.filtersInput}
                  placeholder="Ej: Titanio, Wolframio..."
                  placeholderTextColor={colors.textMuted}
                  value={tempMetalOtherText}
                  onChangeText={setTempMetalOtherText}
                />
              </>
            ) : null}
            {tempMetalCategoryFilter &&
              tempMetalCategoryFilter !== "otro" &&
              METAL_GROUPS.find((g) => g.id === tempMetalCategoryFilter)
                ?.variants && (
                <>
                  <Text style={styles.filtersLabel}>Subtipo</Text>
                  <View style={styles.filtersMetalGrid}>
                    {METAL_GROUPS.find(
                      (g) => g.id === tempMetalCategoryFilter,
                    )!.variants!.map((variant: string) => (
                      <TouchableOpacity
                        key={variant}
                        style={[
                          styles.filtersMetalChip,
                          tempMetalSubtypeFilter === variant &&
                            styles.filtersMetalChipActive,
                        ]}
                        onPress={() =>
                          setTempMetalSubtypeFilter((current) =>
                            current === variant ? null : variant,
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.filtersMetalChipText,
                            tempMetalSubtypeFilter === variant &&
                              styles.filtersMetalChipTextActive,
                          ]}
                        >
                          {variant}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            <Text style={styles.filtersLabel}>Ubicación</Text>
            <TextInput
              style={styles.filtersInput}
              placeholder="Ej: Buenos Aires, Rosario..."
              placeholderTextColor={colors.textMuted}
              value={tempLocationFilter}
              onChangeText={setTempLocationFilter}
            />
            <View style={styles.filtersActions}>
              <TouchableOpacity
                style={styles.filtersClearButton}
                onPress={() => {
                  setTempMetalCategoryFilter(null);
                  setTempMetalSubtypeFilter(null);
                  setTempMetalOtherText("");
                  setTempLocationFilter("");
                  setMetalCategoryFilter(null);
                  setMetalSubtypeFilter(null);
                  setMetalOtherFilter("");
                  setLocationFilter("");
                  setFiltersModalVisible(false);
                  fetchListings(true);
                }}
              >
                <Text style={styles.filtersClearText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filtersApplyButton}
                onPress={() => {
                  setMetalCategoryFilter(tempMetalCategoryFilter);
                  setMetalSubtypeFilter(tempMetalSubtypeFilter);
                  setMetalOtherFilter(
                    tempMetalCategoryFilter === "otro"
                      ? tempMetalOtherText
                      : "",
                  );
                  setLocationFilter(tempLocationFilter);
                  setFiltersModalVisible(false);
                  fetchListings(true);
                }}
              >
                <Text style={styles.filtersApplyText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={contactModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.contactModalContent}>
            <Text style={styles.contactModalTitle}>Iniciar negociación</Text>
            <Text style={styles.contactModalBody}>
              Se abrirá un chat privado con {contactListing?.userName ?? ""}{" "}
              vinculado a esta publicación.
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
              <TouchableOpacity
                style={styles.contactModalConfirm}
                onPress={handleConfirmContact}
              >
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
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: { color: colors.textSecondary },
  emptyWrap: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textSecondary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flex: 1 },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerBadges: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" },
  badgePillGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(14,203,129,0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  badgeGreenText: { color: colors.success, fontSize: 11, fontWeight: "500" },
  badgePillYellow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(240,185,11,0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeYellowText: { color: colors.primary, fontSize: 11, fontWeight: "500" },
  headerIcons: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  sortSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginHorizontal: spacing.md,
  },
  sortLabel: { color: colors.textSecondary, fontSize: 13 },
  sortButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortButtonText: { color: colors.text, fontSize: 13, fontWeight: "500" },
  listContent: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingTop: 120,
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortOption: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  sortOptionActive: { backgroundColor: "rgba(240,185,11,0.15)" },
  sortOptionText: { color: colors.text, fontSize: 15 },
  sortOptionTextActive: { color: colors.primary, fontWeight: "600" },
  filtersModalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  filtersTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  filtersLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  filtersInput: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersMetalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  filtersMetalChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filtersMetalChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(240,185,11,0.1)",
  },
  filtersMetalChipText: { color: colors.text, fontSize: 13 },
  filtersMetalChipTextActive: { color: colors.primary, fontWeight: "600" },
  filtersActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filtersClearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersClearText: { color: colors.textSecondary, fontSize: 13 },
  filtersApplyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  filtersApplyText: { color: "#0D0D0F", fontSize: 13, fontWeight: "600" },
  contactModalContent: {
    backgroundColor: "#fff",
    marginHorizontal: spacing.lg,
    marginTop: 200,
    borderRadius: 12,
    padding: spacing.lg,
  },
  contactModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: spacing.sm,
  },
  contactModalBody: { color: "#333", fontSize: 14, marginBottom: spacing.lg },
  contactModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
  },
  contactModalCancel: { paddingVertical: spacing.sm },
  contactModalCancelText: {
    color: colors.info,
    fontSize: 14,
    fontWeight: "600",
  },
  contactModalConfirm: { paddingVertical: spacing.sm },
  contactModalConfirmText: {
    color: colors.info,
    fontSize: 14,
    fontWeight: "600",
  },
});
