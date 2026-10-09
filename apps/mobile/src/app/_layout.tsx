import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFonts, Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_600SemiBold, Vazirmatn_700Bold } from "@expo-google-fonts/vazirmatn";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initializeAppDatabase } from "../database/bootstrap";
import { theme } from "../theme/tokens";

type BootstrapState = "loading" | "ready" | "error";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
  });
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap(): Promise<void> {
      setBootstrapState("loading");

      try {
        await initializeAppDatabase();

        if (isMounted) {
          setBootstrapState("ready");
        }
      } catch (error: unknown) {
        console.error("App database initialization failed.", error);

        if (isMounted) {
          setBootstrapState("error");
        }
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [attempt]);

  useEffect(() => {
    if (fontError) {
      console.error("Vazirmatn font loading failed.", fontError);
    }
  }, [fontError]);

  const fontReady = fontsLoaded || fontError !== null;
  const appReady = bootstrapState === "ready" && fontReady;

  return (
    <>
      <StatusBar style="light" />
      {appReady ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        />
      ) : (
        <View style={styles.container}>
          <Text style={styles.brand}>OLYMPIC</Text>

          <View style={styles.panel}>
            {bootstrapState === "error" ? (
              <>
                <Text style={styles.title}>آماده‌سازی انجام نشد</Text>
                <Text style={styles.description}>دیتابیس یا داده‌های تمرین بارگذاری نشدند. دوباره تلاش کنید.</Text>
                <Pressable accessibilityRole="button" onPress={() => setAttempt((current) => current + 1)} style={styles.button}>
                  <Text style={styles.buttonText}>تلاش دوباره</Text>
                </Pressable>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.title}>در حال آماده‌سازی کتابخانه</Text>
                <Text style={styles.description}>اطلاعات تمرین‌ها برای استفادهٔ آفلاین آماده می‌شوند.</Text>
              </>
            )}
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  brand: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.small.fontSize,
    letterSpacing: 4,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
  },
  title: {
    marginTop: theme.spacing.lg,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.subtitle.fontSize,
    lineHeight: theme.typography.subtitle.lineHeight,
    textAlign: "center",
    writingDirection: "rtl",
  },
  description: {
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
  buttonText: {
    color: theme.colors.background,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
});
