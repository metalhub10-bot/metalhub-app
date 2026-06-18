import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { router } from "expo-router";

export default function ConfiguracionScreen() {

  return (
  <SafeAreaView style={styles.safe} edges={["top"]}>
    <ScrollView style={styles.container}>
      <View style={styles.allContent}>
        <View style={styles.upperDiv}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/(admin)")}
          >
            <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logo}>Configuración</Text>
        </View>
        <View style={styles.activityUpper}>
          <Text style={styles.adminSubtitle}>General</Text>
        </View>
        <View style={styles.activityBoxContent}>
          <View style={styles.activityBox2}>
            <Ionicons name="storefront-outline" size={30} color={colors.info} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Información de la empresa</Text>
              <Text style={styles.activityBoxSubtitle}>Nombre, logo, descripción, contacto</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="people-outline" size={30} color={colors.success} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Administradores</Text>
              <Text style={styles.activityBoxSubtitle}>Gestionar administradores y permisos</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="documents-outline" size={30} color={colors.successHover} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Roles y permisos</Text>
              <Text style={styles.activityBoxSubtitle}>Configurar roles del sistema</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
        </View>
        <View style={styles.activityUpper}>
          <Text style={styles.adminSubtitle}>Contenido</Text>
        </View>
        <View style={styles.activityBoxContent}>
          <TouchableOpacity style={styles.activityBox2} onPress={() => router.push("/categories")}>
            <Ionicons name="pricetags-outline" size={30} color='#813DC6' />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Categorías</Text>
              <Text style={styles.activityBoxSubtitle}>Gestionar categorías</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.activityBox}>
            <Ionicons name="location-outline" size={30} color={colors.info} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Ubicaciones</Text>
              <Text style={styles.activityBoxSubtitle}>Gestionar ciudades y provincias</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="ban-outline" size={30} color={colors.danger} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Palabras bloqueadas</Text>
              <Text style={styles.activityBoxSubtitle}>Gestionar contenido prohibido</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
        </View>
        <View style={styles.activityUpper}>
          <Text style={styles.adminSubtitle}>Sistema</Text>
        </View>
        <View style={styles.activityBoxContent}>
          <TouchableOpacity style={styles.activityBox2} onPress={() => router.push("/notificaciones")}>
            <Ionicons name="notifications-outline" size={30} color={colors.primary} />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Notificaciones</Text>
              <Text style={styles.activityBoxSubtitle}>Configurar alertas y notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.activityBox}>
            <Ionicons name="cloud-upload-outline" size={30} color='#FFA62A' />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Respaldos</Text>
              <Text style={styles.activityBoxSubtitle}>Gestionar respaldos del sistema</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
          <View style={styles.activityBox}>
            <Ionicons name="shield-checkmark-outline" size={30} color='#DB7C26' />
            <View style={styles.activityBoxText}>
              <Text style={styles.activityBoxTitle}>Seguridad</Text>
              <Text style={styles.activityBoxSubtitle}>Sesiones, contraseñas y 2FA</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={15} color={colors.text} />
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  logo: {
    fontSize: 22,
    fontWeight: "500",
    color: colors.text,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '1.5rem',
    paddingTop: 5,
    paddingBottom: 5,
  },
  iconBtn: {
    alignItems: "center",
    justifyContent: "center",
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
  adminSubtitle: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 13,
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
    paddingVertical: '1rem',
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
    width: '14rem',
  },
  activityBoxTitle: {
    color: colors.text
  },
  activityBoxSubtitle: {
    fontSize: 12,
    color: colors.textSecondary
  },
});