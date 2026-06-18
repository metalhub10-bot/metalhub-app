import React, { useEffect, useState } from "react";
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

const SEGMENTS = [
  {
    id: "all",
    title: "Todos los usuarios",
    description:
      "Enviar a todos los usuarios registrados",
  },
  {
    id: "active",
    title: "Usuarios activos",
    description:
      "Usuarios activos últimos 30 días",
  },
  {
    id: "buyers",
    title: "Compradores",
    description:
      "Usuarios que compran metal",
  },
  {
    id: "sellers",
    title: "Vendedores",
    description:
      "Usuarios que venden metal",
  },
  {
    id: "verified",
    title: "Verificados",
    description:
      "Solo cuentas verificadas",
  },
];

export default function NotificacionesScreen() {
  const [active, setActive] = useState('todas');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortId, setSortId] = useState("recent");
  const [selectedSegment, setSelectedSegment] = useState('all');

  return (
  <SafeAreaView style={styles.safe}>
    <ScrollView style={styles.container}>
      <View style={styles.allContent}>
        <View style={styles.upperDiv}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/notificaciones")}
          >
            <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logo}>Nueva notificación</Text>
        </View>
        <View style={styles.searchContent}>
          <Text style={styles.notifyTitle}>Título</Text>
          <TextInput
            style={styles.notifyInput}
            placeholder="Ej: Actualización importante"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.searchContent}>
          <Text style={styles.notifyTitle}>Mensaje</Text>
          <TextInput
            style={styles.notifyInput}
            placeholder="Ej: Actualización importante"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.searchContent}>
          <Text style={styles.notifyTitle}>Segmento</Text>
          <TextInput
            style={styles.notifyInput}
            placeholder="Ej: Actualización importante"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.searchContent}>
          <Text style={styles.notifyTitle}>Enviar</Text>
          <TextInput
            style={styles.notifyInput}
            placeholder="Ej: Actualización importante"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>Revisar y enviar</Text>
        </TouchableOpacity>
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
  searchContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.5rem',
  },
  notifyInput: {
    backgroundColor: colors.card,
    gap: '.8rem',
    paddingHorizontal: '.8rem',
    paddingVertical: '1rem',
    borderRadius: '.8rem',
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  notifyTitle: {
    color: colors.textSecondary,
  },
  sendBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: '1rem',
    borderRadius: '1rem',
  },
  sendBtnText: {
    fontSize: 17,
    fontWeight: '500',
  },
});