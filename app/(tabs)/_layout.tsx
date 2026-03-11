import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/config/theme";
import { TermsModal, TERMS_KEY, setTermsAccepted } from "@/components/TermsModal";

export default function TabLayout() {
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TERMS_KEY).then((val) => {
      if (val !== "true") setShowTerms(true);
    });
  }, []);

  const handleAccept = async () => {
    await setTermsAccepted();
    setShowTerms(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Mercado",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="express"
          options={{
            title: "Express",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flash" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="publicar"
          options={{
            title: "Publicar",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <TermsModal
        visible={showTerms}
        onAccept={handleAccept}
        onClose={() => setShowTerms(false)}
      />
    </>
  );
}
