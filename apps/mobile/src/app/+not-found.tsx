import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "../theme/tokens";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons color={theme.colors.primary} name="search-outline" size={38} />
        </View>

        <Text style={styles.title}>این صفحه پیدا نشد</Text>
        <Text style={styles.description}>ممکن است نشانی صفحه تغییر کرده باشد یا دیگر در دسترس نباشد.</Text>

        <Pressable accessibilityRole="button" onPress={() => router.replace("/")} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>بازگشت به خانه</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
  },
  title: {
    marginTop: theme.spacing.xl,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
  description: {
    maxWidth: 320,
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "center",
    writingDirection: "rtl",
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: theme.colors.background,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
  },
});
