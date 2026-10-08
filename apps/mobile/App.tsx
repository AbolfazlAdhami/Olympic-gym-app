import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { getDatabase } from "./src/database/client";
import { initializeAppDatabase } from "./src/database/bootstrap";

type ScreenState = { status: "loading" } | { status: "ready"; exerciseCount: number } | { status: "error" };

export default function App() {
  const [screenState, setScreenState] = useState<ScreenState>({
    status: "loading",
  });

  const initialize = useCallback(async () => {
    setScreenState({ status: "loading" });

    try {
      await initializeAppDatabase();

      const database = await getDatabase();
      const result = await database.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM exercises");

      if (result === null) {
        throw new Error("Could not read the exercise count.");
      }

      setScreenState({
        status: "ready",
        exerciseCount: result.count,
      });
    } catch {
      setScreenState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#111411" />
      <View style={styles.container}>
        <Text style={styles.brand}>GYM APP</Text>
        <View style={styles.panel}>
          {screenState.status === "loading" && (
            <>
              <ActivityIndicator size="large" color="#A6FF4D" />
              <Text style={styles.title}>در حال آماده‌سازی کتابخانه</Text>
              <Text style={styles.description}>اطلاعات تمرین‌ها در دستگاه ذخیره می‌شوند.</Text>
            </>
          )}

          {screenState.status === "ready" && (
            <>
              <Text style={styles.successMark}>✓</Text>
              <Text style={styles.title}>کتابخانه آماده است</Text>
              <Text style={styles.description}>{new Intl.NumberFormat("fa-IR").format(screenState.exerciseCount)} تمرین برای استفاده آفلاین ذخیره شد.</Text>
            </>
          )}

          {screenState.status === "error" && (
            <>
              <Text style={styles.title}>آماده‌سازی انجام نشد</Text>
              <Text style={styles.description}>دیتابیس یا داده‌های تمرین بارگذاری نشدند. دوباره تلاش کنید.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void initialize();
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>تلاش دوباره</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111411",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brand: {
    color: "#A6FF4D",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 4,
    marginBottom: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A3327",
    backgroundColor: "#191D18",
  },
  successMark: {
    color: "#A6FF4D",
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 12,
  },
  title: {
    color: "#F4F7F1",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
  },
  description: {
    color: "#A9B0A5",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: "#A6FF4D",
  },
  buttonText: {
    color: "#111411",
    fontSize: 15,
    fontWeight: "700",
  },
});
