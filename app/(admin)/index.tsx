import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { colors, spacing, borderRadius } from "@/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { getMe, getAdminDashboardStats } from "@/services/api";
import { router } from "expo-router";

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

export default function AdminScreen() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

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

  const loadDashboard = async () => {
    try {
      const res = await getAdminDashboardStats();

      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Refrescar perfil al volver a la pestaña (p. ej. tras editar y guardar avatar)
  useFocusEffect(
    React.useCallback(() => {
      if (user !== null) loadProfile();
    }, [loadProfile, user]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando Administrador...</Text>
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
  <SafeAreaView style={styles.safe}>
    <View style={styles.allContent}>
        <View style={styles.upperDiv}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons name="home" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logo}>Metalhub Admin</Text>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </View>
        <View style={styles.superAdminContent}>
          <View style={styles.superAdminImg}>
          </View>
          <View style={styles.adminContentText}>
            <Text style={styles.superAdminTitle}>Hola, {user && user.nombre}</Text>
            <View style={styles.adminRoleContent}>
              <Ionicons name="diamond-outline" size={14} color={colors.primary} />
              <Text style={styles.superAdminRole}>{user && user.rol}</Text>
            </View>
            <Text style={styles.superAdminText}>Panel de administración</Text>
          </View>
        </View>
        <View>
          <Text style={styles.adminSubtitle}>Resumen General</Text>
        </View>
        <View style={styles.contentResumeBox}>
          <View style={styles.resumeBox}>
            <View>
              <Ionicons name="people-outline" size={30} color={colors.success} />
            </View>
            <View style={styles.resumeBoxCont}>
              <Text style={styles.resumeBoxTitle}>{stats?.users.total ?? 0}</Text>
              <Text style={styles.resumeBoxText}>Usuarios</Text>
              <Text style={styles.resumeBoxMiniText1}>+{stats?.reportes.today ?? 0} hoy</Text>
            </View>
          </View>
          <View style={styles.resumeBox}>
            <View>
              <Ionicons name="document-text-outline" size={30} color={colors.primary} />
            </View>
            <View style={styles.resumeBoxCont}>
              <Text style={styles.resumeBoxTitle}>{stats?.publicaciones.total ?? 0}</Text>
              <Text style={styles.resumeBoxText}>Publicaciones</Text>
              <Text style={styles.resumeBoxMiniText2}>+{stats?.publicaciones.today ?? 0} hoy</Text>
            </View>
          </View>
          <View style={styles.resumeBox}>
            <View>
              <Ionicons name="cart-outline" size={30} color={colors.info} />
            </View>
            <View style={styles.resumeBoxCont}>
              <Text style={styles.resumeBoxTitle}>{stats?.ofertasActivas.total ?? 0}</Text>
              <Text style={styles.resumeBoxText}>Ofertas activas</Text>
              <Text style={styles.resumeBoxMiniText3}>+{stats?.ofertasActivas.today ?? 0} hoy</Text>
            </View>
          </View>
          <View style={styles.resumeBox}>
            <View>
              <Ionicons name="flag-outline" size={30} color={colors.danger} />
            </View>
            <View style={styles.resumeBoxCont}>
              <Text style={styles.resumeBoxTitle}>{stats?.reportes.total ?? 0}</Text>
              <Text style={styles.resumeBoxText}>Reportes</Text>
              <Text style={styles.resumeBoxMiniText4}>+{stats?.reportes.today ?? 0} hoy</Text>
            </View>
          </View>
        </View>
        <View style={styles.activityUpper}>
          <Text style={styles.adminSubtitle}>Actividad Reciente</Text>
          <TouchableOpacity><Text style={styles.adminLink}>Ver todo</Text></TouchableOpacity>
        </View>
        <View style={styles.activityBoxContent}>
          <View style={styles.activityBox2}>
            <Ionicons name="person-add-outline" size={30} color={colors.success} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Nuevo usuario registrado</Text>
              <Text style={styles.activityBoxSubtitle}>Juan Pérez</Text>
            </View>
            <Text style={styles.activityBoxSubtitle}>Hace 10 min</Text>
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="document-text-outline" size={30} color={colors.primary} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Nueva publicación</Text>
              <Text style={styles.activityBoxSubtitle}>Acero inoxidable - 30.000 tn</Text>
            </View>
            <Text style={styles.activityBoxSubtitle}>Hace 25 min</Text>
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="flag-outline" size={30} color={colors.danger} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Reporte recibido</Text>
              <Text style={styles.activityBoxSubtitle}>Publicación #1234</Text>
            </View>
            <Text style={styles.activityBoxSubtitle}>Hace 45 min</Text>
          </View>
        </View>
        <View>
          <View style={styles.activityUpper}>
            <Text style={styles.adminSubtitle}>Accesos Rápidos</Text>
          </View>
        </View>
        <View style={styles.contentFastBox}>
          <TouchableOpacity style={styles.fastBox} onPress={() => router.push("/usuarios")}>
            <Ionicons name="people-outline" size={30} color={colors.success} />
            <Text style={styles.fastBoxText}>Usuarios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fastBox} onPress={() => router.push("/publicaciones")}>
            <Ionicons name="document-text-outline" size={30} color={colors.primary} />
            <Text style={styles.fastBoxText}>Publicaciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fastBox} onPress={() => router.push("/notificaciones")}>
            <Ionicons name="notifications-outline" size={30} color='#DB7C26' />
            <Text style={styles.fastBoxText}>Notificaciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fastBox} onPress={() => router.push("/configuracion")}>
            <Ionicons name="settings-outline" size={30} color={colors.textSecondary} />
            <Text style={styles.fastBoxText}>Configuración</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  logo: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  container: { flex: 1 },
  content: { padding: spacing.md },
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
  versionText: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
  },
  allContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    paddingTop: '.5rem',
  },
  upperDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  superAdminContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '1.5rem',
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    width: '100%',
    padding: '1.3rem',
    paddingTop: '0.8rem',
    paddingBottom: '0.8rem',
    borderRadius: 10,
  },
  superAdminImg: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  adminContentText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  superAdminTitle: {
    color: colors.text,
    fontSize: 22,
  },
  adminRoleContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '.5rem',
  },
  superAdminRole: {
    color: colors.primary,
    fontSize: 15,
    textTransform: 'capitalize',
  },
  superAdminText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  contentResumeBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: '.3rem',
  },
  adminSubtitle: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  resumeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '1rem',
    flexDirection: 'row',
    backgroundColor: colors.input,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    width: '100%',
    padding: '1.3rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    borderRadius: 10,
  },
  resumeBoxCont: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  resumeBoxTitle: {
    color: colors.text,
    fontSize: 20,
  },
  resumeBoxText: {
    color: colors.textSecondary,
  },
  resumeBoxMiniText1: {
    color: colors.success,
    fontSize: 12,
  },
  resumeBoxMiniText2: {
    color: colors.primary,
    fontSize: 12,
  },
  resumeBoxMiniText3: {
    color: colors.info,
    fontSize: 12,
  },
  resumeBoxMiniText4: {
    color: colors.danger,
    fontSize: 12,
  },
  activityUpper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: '.6rem',
  },
  adminLink: {
    color: colors.primary,
  },
  activityBoxContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: colors.input,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    padding: '1.5rem',
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: '1.2rem',
    width: '100%',
  },
  activityBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingTop: '1.3rem',
    paddingBottom: '1.3rem',
    width: '100%',
  },
  activityBox2: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexDirection: 'row',
    paddingTop: '1.3rem',
    paddingBottom: '1.3rem',
    width: '100%',
  },
  activityBoxText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.3rem',
    width: '11rem',
  },
  activityBoxTitle: {
    color: colors.text
  },
  activityBoxSubtitle: {
    fontSize: 12,
    color: colors.textSecondary
  },
  contentFastBox: {
    display: 'flex',
    flexDirection: 'row',
    gap: '.5rem',
    justifyContent: 'space-around',
  },
  fastBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: colors.input,
    borderRadius: 10,
    padding: '.6rem',
    paddingTop: '1rem',
    width: '5.5rem',
    paddingBottom: '1rem',
  },
  fastBoxText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});