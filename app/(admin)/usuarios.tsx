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
import { SORT_OPTIONS, METAL_GROUPS } from "@/config/constants";

type FilterTab = 'todos' | 'activos' | 'inactivos' | 'bloqueados';

interface FilterTabsProps {
  active: FilterTab;
  onSelect: (tab: FilterTab) => void;
  sortLabel?: string;
  onSortPress?: () => void;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'inactivos', label: 'Inactivos' },
  { id: 'bloqueados', label: 'Bloqueados' },
];

const STATUS_STYLES = {
  activo: {
    color: colors.success,
    backgroundColor: "rgba(14,203,129,0.12)",
  },
  inactivo: {
    color: "#F0A500",
    backgroundColor: "rgba(240,165,0,0.12)",
  },
  bloqueado: {
    color: colors.danger,
    backgroundColor: "rgba(255,77,77,0.12)",
  },
};

export default function AdminUserScreen() {
  const [active, setActive] = useState('todos');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortId, setSortId] = useState("recent");
  const [user, setUser] = useState(null);

  const sortLabel =
    SORT_OPTIONS.find((s) => s.id === sortId)?.label ?? "Más reciente";

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
          <Text style={styles.logo}>Usuarios</Text>
        </View>
        <View style={styles.searchContent}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.filtersInput}
            placeholder="Buscar usuarios..."
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
        <View style={styles.userCardContainer}>
          <View style={styles.userCard}>
            <View style={styles.userImg}></View>
            <View style={styles.userNameText}>
              <Text style={styles.userCardName}>Juan Pérez</Text>
              <Text style={styles.userCardText}>juanperez@gmail.com</Text>
              <Text style={styles.userCardText}>Registrado: hace 2 días</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.userRoleStatus}>
                <Text style={styles.userRole}>Usuario</Text>
                <Text style={styles.userStatus}>Activo</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userCard}>
            <View style={styles.userImg}></View>
            <View style={styles.userNameText}>
              <Text style={styles.userCardName}>Juan Pérez</Text>
              <Text style={styles.userCardText}>juanperez@gmail.com</Text>
              <Text style={styles.userCardText}>Registrado: hace 2 días</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.userRoleStatus}>
                <Text style={styles.userRole}>Usuario</Text>
                <Text style={styles.userStatus}>Activo</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userCard}>
            <View style={styles.userImg}></View>
            <View style={styles.userNameText}>
              <Text style={styles.userCardName}>Juan Pérez</Text>
              <Text style={styles.userCardText}>juanperez@gmail.com</Text>
              <Text style={styles.userCardText}>Registrado: hace 2 días</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.userRoleStatus}>
                <Text style={styles.userRole}>Usuario</Text>
                <Text style={styles.userStatus}>Activo</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userCard}>
            <View style={styles.userImg}></View>
            <View style={styles.userNameText}>
              <Text style={styles.userCardName}>Juan Pérez</Text>
              <Text style={styles.userCardText}>juanperez@gmail.com</Text>
              <Text style={styles.userCardText}>Registrado: hace 2 días</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.userRoleStatus}>
                <Text style={styles.userRole}>Usuario</Text>
                <Text style={styles.userStatus}>Activo</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userCard}>
            <View style={styles.userImg}></View>
            <View style={styles.userNameText}>
              <Text style={styles.userCardName}>Juan Pérez</Text>
              <Text style={styles.userCardText}>juanperez@gmail.com</Text>
              <Text style={styles.userCardText}>Registrado: hace 2 días</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.userRoleStatus}>
                <Text style={styles.userRole}>Usuario</Text>
                <Text style={styles.userStatus}>Activo</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.userCard}>
            <View style={styles.userImg}></View>
            <View style={styles.userNameText}>
              <Text style={styles.userCardName}>Juan Pérez</Text>
              <Text style={styles.userCardText}>juanperez@gmail.com</Text>
              <Text style={styles.userCardText}>Registrado: hace 2 días</Text>
            </View>
            <View style={styles.userActions}>
              <View style={styles.userRoleStatus}>
                <Text style={styles.userRole}>Usuario</Text>
                <Text style={styles.userStatus}>Activo</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
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
  tabs: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#0D0D0F', fontWeight: '600' },
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
  sortSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sortLabel: { color: colors.textSecondary, fontSize: 13 },
  sortButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortButtonText: { color: colors.text, fontSize: 13, fontWeight: "500" },
  userCardContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  searchContent: {
    backgroundColor: colors.card,
    display: 'flex',
    flexDirection: 'row',
    gap: '.8rem',
    padding: '.8rem',
    borderRadius: '.8rem',
  },
  userCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: colors.card,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: '1rem',
    paddingHorizontal: '.5rem',
  },
  userImg: {
    width: '3rem',
    height: '3rem',
    backgroundColor: colors.cardElevated,
    borderRadius: '50%',
    borderWidth: 1,
    borderColor: colors.textSecondary
  },
  userNameText: {
    width: '8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '.1rem',
  },
  userCardName: {
    color: colors.text,
  },
  userCardText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  userActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1.5rem',
  },
  userRoleStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '.3rem',
    alignItems: 'center',
  },
  userRole: {
    color: colors.info,
    backgroundColor: 'rgba(37,92,153,0.3)',
    paddingHorizontal: '.5rem',
    paddingVertical: '.2rem',
    borderRadius: '.5rem',
  },
  userStatus: {
    color: colors.success,
  },
});