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

type FilterTab = 'todas' | 'programadas' | 'enviadas' | 'borradores';

interface FilterTabsProps {
  active: FilterTab;
  onSelect: (tab: FilterTab) => void;
  sortLabel?: string;
  onSortPress?: () => void;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'programadas', label: 'Programadas' },
  { id: 'enviadas', label: 'Enviadas' },
  { id: 'borradores', label: 'Borradores' },
];

export default function NotificacionesScreen() {
  const [active, setActive] = useState('todas');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortId, setSortId] = useState("recent");

  return (
  <SafeAreaView style={styles.safe}>
    <ScrollView style={styles.container}>
      <View style={styles.allContent}>
        <View style={styles.upperDiv}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/(admin)")}
          >
            <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logo}>Reportes</Text>
        </View>
        <View style={styles.searchContent}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.filtersInput}
            placeholder="Buscar reportes..."
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active === tab.id && styles.tabActive]}
              onPress={() => onSelect(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.containerNotificationCards}>
          <View style={styles.adminNotificationCard}>
            <View style={styles.notificationIcon}>
              <Ionicons name="megaphone-outline" size={30} color='#813DC6' />
            </View>
            <View style={styles.notifyContent}>
              <Text style={styles.notifyContentTitle}>Actualización importante</Text>
              <Text style={styles.notifyContentText}>Hola, Leonel</Text>
              <Text style={styles.notifyContentStatus}>Enviada</Text>
              <Text style={styles.notifyContentText}>Enviado a 8.271 usuarios</Text>
            </View>
            <View style={styles.contentDateMore}>
              <Text style={styles.dateText}>18 May</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.adminNotificationCard}>
            <View style={styles.notificationIcon}>
              <Ionicons name="megaphone-outline" size={30} color='#813DC6' />
            </View>
            <View style={styles.notifyContent}>
              <Text style={styles.notifyContentTitle}>Actualización importante</Text>
              <Text style={styles.notifyContentText}>Hola, Leonel</Text>
              <Text style={styles.notifyContentStatus}>Enviada</Text>
              <Text style={styles.notifyContentText}>Enviado a 8.271 usuarios</Text>
            </View>
            <View style={styles.contentDateMore}>
              <Text style={styles.dateText}>18 May</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.adminNotificationCard}>
            <View style={styles.notificationIcon}>
              <Ionicons name="megaphone-outline" size={30} color='#813DC6' />
            </View>
            <View style={styles.notifyContent}>
              <Text style={styles.notifyContentTitle}>Actualización importante</Text>
              <Text style={styles.notifyContentText}>Hola, Leonel</Text>
              <Text style={styles.notifyContentStatus}>Enviada</Text>
              <Text style={styles.notifyContentText}>Enviado a 8.271 usuarios</Text>
            </View>
            <View style={styles.contentDateMore}>
              <Text style={styles.dateText}>18 May</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.adminNotificationCard}>
            <View style={styles.notificationIcon}>
              <Ionicons name="megaphone-outline" size={30} color='#813DC6' />
            </View>
            <View style={styles.notifyContent}>
              <Text style={styles.notifyContentTitle}>Actualización importante</Text>
              <Text style={styles.notifyContentText}>Hola, Leonel</Text>
              <Text style={styles.notifyContentStatus}>Enviada</Text>
              <Text style={styles.notifyContentText}>Enviado a 8.271 usuarios</Text>
            </View>
            <View style={styles.contentDateMore}>
              <Text style={styles.dateText}>18 May</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.adminNotificationCard}>
            <View style={styles.notificationIcon}>
              <Ionicons name="megaphone-outline" size={30} color='#813DC6' />
            </View>
            <View style={styles.notifyContent}>
              <Text style={styles.notifyContentTitle}>Actualización importante</Text>
              <Text style={styles.notifyContentText}>Hola, Leonel</Text>
              <Text style={styles.notifyContentStatus}>Enviada</Text>
              <Text style={styles.notifyContentText}>Enviado a 8.271 usuarios</Text>
            </View>
            <View style={styles.contentDateMore}>
              <Text style={styles.dateText}>18 May</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
  searchContent: {
    backgroundColor: colors.card,
    display: 'flex',
    flexDirection: 'row',
    gap: '.8rem',
    padding: '.8rem',
    borderRadius: '.8rem',
  },
  tabs: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  tab: { paddingHorizontal: '.8rem', paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#0D0D0F', fontWeight: '600' },
  containerNotificationCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.5rem',
  },
  adminNotificationCard: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colors.input,
    paddingHorizontal: '.2rem',
    paddingVertical: '1rem',
    borderRadius: '.8rem',
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: 'space-around',
  },
  notificationIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgba(129,61,198,0.2)",
    width: '3.2rem',
    height: '3.2rem',
    borderRadius: '.6rem',
  },
  notifyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.4rem',
    width: '12.5rem',
    alignItems: 'flex-start',
  },
  notifyContentTitle: {
    color: colors.text,
    fontSize: 16,
  },
  notifyContentText: {
    color: colors.textSecondary,
  },
  notifyContentStatus: {
    color: colors.success,
    backgroundColor: colors.successSoft,
    paddingVertical: '.2rem',
    paddingHorizontal: '.5rem',
    borderRadius: '.5rem',
  },
  contentDateMore: {
    display: 'flex',
    flexDirection: 'row',
    gap: '.6rem',
    paddingTop: '.2rem',
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});