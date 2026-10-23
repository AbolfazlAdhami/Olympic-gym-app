import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFonts, Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_600SemiBold, Vazirmatn_700Bold } from "@expo-google-fonts/vazirmatn";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initializeAppDatabase } from "../database/bootstrap";
import { theme } from "../theme/tokens";

type BootstrapState = "loading" | "ready" | "error";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  console.error("An unexpected screen error occurred.", error);

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>مشکلی پیش آمد</Text>
      <Text style={styles.errorDescription}>صفحه نتوانست بارگذاری شود. دوباره تلاش کنید.</Text>
      <Pressable accessibilityRole="button" onPress={() => void retry()} style={styles.button}>
        <Text style={styles.buttonText}>تلاش دوباره</Text>
      </Pressable>
    </View>
  );
}
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
  });
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>("loading");
  const [attempt, setAttempt] = useState(0);
  const progressPosition = useRef(new Animated.Value(0)).current;
  const fontReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (bootstrapState !== "loading" || !fontReady) {
      progressPosition.stopAnimation();
      return;
    }

    const progressAnimation = Animated.loop(
      Animated.timing(progressPosition, {
        toValue: 1,
        duration: 1250,
        useNativeDriver: true,
      }),
    );

    progressPosition.setValue(0);
    progressAnimation.start();

    return () => progressAnimation.stop();
  }, [bootstrapState, fontReady, progressPosition]);

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
                <Image
                  accessibilityLabel="لوگوی اپلیکیشن المپیک"
                  source={require("../../assets/icon.png")}
                  style={styles.logo}
                />
                <Text style={styles.title}>در حال آماده‌سازی کتابخانه</Text>
                <Text style={styles.description}>اطلاعات تمرین‌ها برای استفادهٔ آفلاین آماده می‌شوند.</Text>
                <View
                  accessibilityLabel="در حال آماده‌سازی اطلاعات تمرین‌ها"
                  accessibilityRole="progressbar"
                  style={styles.progressTrack}
                >
                  <Animated.View
                    style={[
                      styles.progressIndicator,
                      {
                        transform: [
                          {
                            translateX: progressPosition.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-148, 148],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </View>
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
  logo: {
    width: 104,
    height: 104,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.radius.xl,
  },
  progressTrack: {
    width: "100%",
    maxWidth: 296,
    height: 5,
    overflow: "hidden",
    marginTop: theme.spacing.xl,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
  },
  progressIndicator: {
    width: "42%",
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
  errorDescription: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
});
