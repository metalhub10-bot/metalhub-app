import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { colors, spacing, borderRadius } from "@/config/theme";
import { getMe, logoutUser, clearSession } from "@/services/api";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";
const appVersionDisplay =
  Platform.OS === "android"
    ? `v${appVersion} (${Constants.expoConfig?.android?.versionCode ?? 1})`
    : `v${appVersion}`;

type ProfileUser = {
  id: string;
  email?: string;
  nombre?: string;
  avatarUrl?: string;
  rol?: string;
  bio?: string;
  ubicacion?: string;
  whatsapp?: string;
  rating?: number;
  operaciones?: number;
  anunciosActivos?: number;
  miembroDesde?: number;
};

export default function PerfilScreen() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfile = React.useCallback(async () => {
    try {
      const meRes = await getMe();
      if (meRes.success && meRes.user) {
        setUser(meRes.user as ProfileUser);
      } else if (
        (meRes as { success?: boolean }).success === false &&
        ((meRes as { message?: string }).message?.includes("Sesión") ||
          (meRes as { message?: string }).message?.includes("inválida"))
      ) {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Refrescar perfil al volver a la pestaña (p. ej. tras editar y guardar avatar)
  useFocusEffect(
    React.useCallback(() => {
      if (user !== null) loadProfile();
    }, [loadProfile, user]),
  );

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logoutUser();
          } catch {
            // ignore
          }
          await clearSession();
          setLoggingOut(false);
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.title}>Mi Perfil</Text>
          <View style={styles.guestCard}>
            <Text style={styles.guestText}>
              Inicia sesión para ver tu perfil y publicar ofertas.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginBtnText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.versionText}>{appVersionDisplay}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.userName}>{user.nombre ?? "Usuario"}</Text>
          <View style={styles.badges}>
            {user.rol ? (
              <View style={styles.badgeRole}>
                <Text style={styles.badgeRoleText}>{user.rol}</Text>
              </View>
            ) : null}
            <View style={styles.badgeVerified}>
              <Ionicons name="checkmark-circle" size={14} color={colors.info} />
              <Text style={styles.badgeVerifiedText}>Verificado</Text>
            </View>
          </View>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
        </View>
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Ionicons name="star" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{user.rating ?? 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="trending-up" size={20} color={colors.success} />
            <Text style={styles.statValue}>{user.operaciones ?? 0}</Text>
            <Text style={styles.statLabel}>Operaciones</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="eye-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.statValue}>{user.anunciosActivos ?? 0}</Text>
            <Text style={styles.statLabel}>Anuncios</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.statValue}>
              {user.miembroDesde ?? new Date().getFullYear()}
            </Text>
            <Text style={styles.statLabel}>Miembro</Text>
          </View>
        </View>
        {user.ubicacion ? (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>{user.ubicacion}</Text>
          </View>
        ) : null}
        {user.whatsapp ? (
          <View style={styles.locationRow}>
            <Ionicons name="logo-whatsapp" size={16} color={colors.success} />
            <Text style={styles.locationText}>{user.whatsapp}</Text>
          </View>
        ) : null}
        <Text style={styles.sectionLabel}>CUENTA</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/mis-publicaciones")}
        >
          <Ionicons name="list" size={22} color={colors.text} />
          <Text style={styles.menuItemText}>Mis publicaciones</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/editar-perfil")}
        >
          <Ionicons name="create-outline" size={22} color={colors.text} />
          <Text style={styles.menuItemText}>Editar perfil</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.versionText}>{appVersionDisplay}</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: { color: colors.textSecondary },
  guestCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestText: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  loginBtnText: { color: "#0D0D0F", fontWeight: "700" },
  profileCard: { alignItems: "center", marginBottom: spacing.lg },
  avatarWrap: { position: "relative", marginBottom: spacing.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.cardElevated,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  badges: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  badgeRole: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeRoleText: { color: "#0D0D0F", fontSize: 12, fontWeight: "600" },
  badgeVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.info,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeVerifiedText: { color: colors.text, fontSize: 12 },
  bio: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
    textAlign: "center",
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { alignItems: "center" },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg,
  },
  locationText: { color: colors.textSecondary, fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemText: { flex: 1, color: colors.text, fontSize: 16 },
  menuItemBadge: { color: colors.success, fontSize: 12, fontWeight: "600" },
  logoutBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: "600" },
  versionText: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
  },
});
