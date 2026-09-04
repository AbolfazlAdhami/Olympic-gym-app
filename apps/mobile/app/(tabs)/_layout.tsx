import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export default function TabsLayout() {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="exercises/index"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color }) => <FontAwesome6 name="dumbbell" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="workouts/index"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => <FontAwesome6 name="person-running" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome6 name="user" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
