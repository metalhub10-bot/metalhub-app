import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { colors, spacing, borderRadius } from "@/config/theme";
import {
  getMisPublicaciones,
  deletePublicacion,
  formatTimeAgo,
  type PublicacionItem,
} from "@/services/api";
import { ListingCard } from "@/components/ListingCard";

export default function MisPublicacionesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicaciones, setPublicaciones] = useState<PublicacionItem[]>([]);

  const fetchPublicaciones = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMisPublicaciones({ limite: 50 });
      if (res.success && Array.isArray(res.data)) {
        setPublicaciones(res.data);
      } else {
        setPublicaciones([]);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al cargar tus publicaciones";
      Alert.alert("Error", message);
      setPublicaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicaciones();
  }, [fetchPublicaciones]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPublicaciones(true);
    }, [fetchPublicaciones]),
  );

  const handleEdit = (id: string) => {
    router.push({
      pathname: "/editar-publicacion/[id]",
      params: { id: String(id) },
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar publicación",
      "¿Seguro que deseas eliminar esta publicación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deletePublicacion(id);
              if (res.success) {
                setPublicaciones((prev) => prev.filter((p) => p.id !== id));
              } else {
                Alert.alert(
                  "Error",
                  res.message ?? "No se pudo eliminar la publicación",
                );
              }
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Error al eliminar";
              Alert.alert("Error", message);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: PublicacionItem }) => {
    const card = (
      <ListingCard
        type={item.tipo === "compro" ? "COMPRA" : "VENTA"}
        metal={item.metal}
        quantity={`${Number(item.cantidad).toLocaleString("es-AR")} ${item.unidad}`}
        price={
          item.precioAConvenir
            ? "$ A convenir"
            : `$${Number(item.precio ?? 0).toLocaleString("es-AR")} /${item.unidad === "tn" ? "tn" : "kg"}`
        }
        description={item.descripcion ?? ""}
        userName={item.usuario?.nombre ?? ""}
        rating={String(item.usuario?.rating ?? 0)}
        location={item.ubicacion ?? item.usuario?.ubicacion ?? ""}
        avatarUrl={item.usuario?.avatarUrl}
        closed={item.cerrada ?? false}
        verified={item.usuario?.verificado ?? false}
        urgent={item.urgente ?? false}
        timeAgo={formatTimeAgo(item.creadoEn)}
        onPress={() =>
          router.push({
            pathname: "/publicacion/[id]",
            params: { id: item.id },
          })
        }
      />
    );

    return <View style={styles.itemContainer}>{card}</View>;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando tus publicaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Mis publicaciones</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchPublicaciones(true)}
          >
            <Ionicons name="refresh" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={publicaciones}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => fetchPublicaciones(true)}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={44}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>No tienes publicaciones aún.</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push("/publicar")}
              >
                <Text style={styles.ctaButtonText}>
                  Crear nueva publicación
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: { padding: spacing.sm },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  refreshBtn: { padding: spacing.sm },
  listContent: { paddingBottom: spacing.lg },
  itemContainer: { marginBottom: spacing.sm },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: { color: colors.textSecondary },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  ctaButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  ctaButtonText: { color: "#0D0D0F", fontWeight: "700" },
});
