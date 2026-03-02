import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';

type FilterTab = 'todos' | 'compran' | 'venden';

interface FilterTabsProps {
  active: FilterTab;
  onSelect: (tab: FilterTab) => void;
  sortLabel?: string;
  onSortPress?: () => void;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'compran', label: 'Compran' },
  { id: 'venden', label: 'Venden' },
];

export function FilterTabs({ active, onSelect, sortLabel = 'Más rec', onSortPress }: FilterTabsProps) {
  return (
    <View style={styles.container}>
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
      {onSortPress && (
        <TouchableOpacity style={styles.sortButton} onPress={onSortPress} activeOpacity={0.8}>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
          <Text style={styles.sortText}> {sortLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  tabs: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#0D0D0F', fontWeight: '600' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  sortText: { color: colors.textSecondary, fontSize: 13 },
});
