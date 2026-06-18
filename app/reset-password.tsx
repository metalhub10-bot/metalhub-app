import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "@/config/theme";
import { loginUser, setSessionId, assertSuccess, changePassword } from "@/services/api";
import { ensurePushTokenRegistered } from "@/services/pushNotifications";


export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange =async () => {
    const cleanPassword = password.trim();
    const cleanRePassword = rePassword.trim();

    if (!token || typeof token !== "string") {
      Alert.alert("Error", "Token inválido o inexistente");
      return;
    }

    if (!cleanPassword || !cleanRePassword) {
      Alert.alert("Error", "Completá todos los campos");
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (cleanPassword !== cleanRePassword) {
      Alert.alert("Error", "Las contraeñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await changePassword(token, cleanPassword);

      assertSuccess(res);

      Alert.alert(
        "Listo",
        res.message || "Contraseña actualizada correctamente",
        [
          {
            text: "Ingresar",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cambiar la contraseña";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.backBtn}
          >
            <Ionicons 
              name="arrow-back"
              color={colors.textSecondary}
              style={{ lineHeight: 20, textAlignVertical: "center" }}
            />
            <Text style={styles.footerLink}>Volver</Text>
          </TouchableOpacity>
          <View style={styles.iconWrap}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.icon}
            />
          </View>
          <Text style={styles.title}>Cambia tu contraseña</Text>
          <View style={styles.passwordRow}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  styles.passwordInputNoBorder,
                ]}
                placeholder="Nueva Contraseña"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                  style={{ lineHeight: 20, textAlignVertical: "center" }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.passwordRow}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  styles.passwordInputNoBorder,
                ]}
                placeholder="Repita la Contraseña"
                placeholderTextColor={colors.textMuted}
                value={rePassword}
                onChangeText={setRePassword}
                secureTextEntry={!showRePassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowRePassword((prev) => !prev)}
              >
                <Ionicons
                  name={showRePassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                  style={{ lineHeight: 20, textAlignVertical: "center" }}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={loading}
            onPress={handleChange}
          >
            {loading ? (
              <ActivityIndicator color="#0D0D0F" />
            ) : (
              <Text style={styles.primaryBtnText}>Cambiar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.xl, flexGrow: 1 },
  iconWrap: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  backBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  icon: { width: 160, height: 160, borderRadius: 36 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: { color: colors.textSecondary, marginBottom: spacing.xl },
  input: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordRow: {
    marginBottom: spacing.md,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    height: 52,
    textAlignVertical: "center",
    marginBottom: 0,
  },
  passwordInputNoBorder: {
    borderWidth: 0,
    borderRadius: 0,
  },
  passwordToggle: {
    justifyContent: "center",
    alignItems: "center",
    height: 52,
    width: 44,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryBtnText: { color: "#0D0D0F", fontSize: 16, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    paddingVertical: spacing.lg,
  },
  footerText: { color: colors.textSecondary },
  footerLink: { color: colors.textSecondary, fontWeight: "600" },
});
