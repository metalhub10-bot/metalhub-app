import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "@/config/theme";

export type ListingType = "COMPRA" | "VENTA";

export interface ListingCardProps {
  type: ListingType;
  metal: string;
  quantity: string;
  price: string;
  description: string;
  userName: string;
  rating: string;
  location: string;
  avatarUrl?: string;
  closed?: boolean;
  verified?: boolean;
  urgent?: boolean;
  timeAgo: string;
  whatsappNumber?: string;
  onContact?: () => void;
  onPress?: () => void;
}

export function ListingCard({
  type,
  metal,
  quantity,
  price,
  description,
  userName,
  rating,
  location,
  avatarUrl,
  closed = false,
  verified = false,
  urgent = false,
  timeAgo,
  whatsappNumber,
  onContact,
  onPress,
}: ListingCardProps) {
  const handleContact = () => {
    if (onContact) {
      onContact();
      return;
    }
    const phone = whatsappNumber || "5491112345678";
    const text = encodeURIComponent(
      `Hola, me interesa tu publicación: ${metal} · ${quantity} - ${price}`,
    );
    Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`);
  };

  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, activeOpacity: 0.9 } : {};

  return (
    <CardWrapper style={styles.card} {...cardProps}>
      <View style={styles.header}>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              type === "COMPRA" ? styles.badgeCompra : styles.badgeVenta,
            ]}
          >
            <Text style={styles.badgeText}>{type}</Text>
          </View>
          {closed && (
            <View style={styles.badgeClosed}>
              <Text style={styles.badgeClosedText}>CERRADA</Text>
            </View>
          )}
          {urgent && (
            <View style={styles.badgeUrgent}>
              <Ionicons name="flash" size={12} color={colors.primary} />
              <Text style={styles.badgeUrgentText}>Urgente</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
      <Text style={styles.metalQuantity}>
        {metal} · {quantity}
      </Text>
      {location ? (
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={colors.textMeta} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      ) : null}
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.footer}>
        <View style={styles.userRow}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userName}</Text>
              {verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.info}
                />
              )}
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={12} color={colors.primary} />
              <Text style={styles.metaText}>{rating}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.contactButton, closed && styles.contactButtonDisabled]}
          onPress={closed ? undefined : handleContact}
          activeOpacity={closed ? 1 : 0.8}
          disabled={closed}
        >
          <Ionicons
            name="chatbubble"
            size={18}
            color={closed ? colors.textSecondary : "#fff"}
          />
          <Text
            style={[
              styles.contactButtonText,
              closed && styles.contactButtonTextDisabled,
            ]}
          >
            {closed ? "Cerrada" : "Contactar"}
          </Text>
        </TouchableOpacity>
      </View>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  badges: { flexDirection: "row", gap: spacing.sm },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeCompra: { backgroundColor: colors.success },
  badgeVenta: { backgroundColor: colors.danger },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  badgeUrgent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(240,185,11,0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeUrgentText: { color: colors.primary, fontSize: 11, fontWeight: "600" },
  badgeClosed: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
  },
  badgeClosedText: { color: "#0D0D0F", fontSize: 11, fontWeight: "600" },
  timeAgo: { color: colors.textSecondary, fontSize: 12 },
  metalQuantity: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  locationText: { color: colors.textMeta, fontSize: 12, flexShrink: 1 },
  price: { color: colors.text, fontSize: 15, marginBottom: 4 },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  userName: { color: colors.text, fontSize: 13, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { color: colors.textSecondary, fontSize: 12 },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  contactButtonDisabled: { backgroundColor: colors.card },
  contactButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  contactButtonTextDisabled: { color: colors.textSecondary },
});
