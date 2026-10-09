import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { theme } from "../../theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 8,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        tabBarLabelStyle: {
          fontFamily: "Vazirmatn_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "خانه",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "تمرین‌ها",
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
