import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS } from "@gym-app/shared";
import { getDatabase } from "../../database/client";
import { theme } from "../../theme/tokens";

interface ExerciseListItem {
  id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
}

function translatedLabel(labels: Readonly<Record<string, string>>, value: string | null, fallback: string): string {
  if (value === null) {
    return fallback;
  }

  return labels[value] ?? value;
}

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<ExerciseListItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadExercises(): Promise<void> {
      setIsLoading(true);
      setHasError(false);

      try {
        const database = await getDatabase();
        const rows = await database.getAllAsync<ExerciseListItem>(
          `SELECT id, name, category, level, equipment
           FROM exercises
           ORDER BY name COLLATE NOCASE`,
        );

        if (isMounted) {
          setExercises(rows);
        }
      } catch (error: unknown) {
        console.error("Exercise list could not be loaded.", error);

        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadExercises();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    if (normalizedSearch.length === 0) {
      return exercises;
    }

    return exercises.filter((exercise) => {
      const category = translatedLabel(CATEGORY_LABELS, exercise.category, "").toLocaleLowerCase();

      return exercise.name.toLocaleLowerCase().includes(normalizedSearch) || category.includes(normalizedSearch);
    });
  }, [exercises, search]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>کتابخانهٔ آفلاین</Text>
          <Text style={styles.title}>تمرین‌ها</Text>
          <Text style={styles.subtitle}>حرکت موردنظرت را در میان تمرین‌های فارسی پیدا کن.</Text>
        </View>

        <TextInput
          accessibilityLabel="جست‌وجو در تمرین‌ها"
          onChangeText={setSearch}
          placeholder="جست‌وجوی حرکت یا دسته"
          placeholderTextColor={theme.colors.textSubtle}
          returnKeyType="search"
          style={styles.searchInput}
          textAlign="right"
          value={search}
        />

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.stateText}>در حال بارگذاری تمرین‌ها</Text>
          </View>
        ) : hasError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>بارگذاری انجام نشد</Text>
            <Text style={styles.stateText}>دوباره تلاش کنید. اطلاعات تمرین‌ها به‌صورت محلی نگهداری می‌شوند.</Text>
            <Pressable accessibilityRole="button" onPress={() => setReloadKey((current) => current + 1)} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>تلاش دوباره</Text>
            </Pressable>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>تمرینی پیدا نشد</Text>
            <Text style={styles.stateText}>عبارت جست‌وجو را تغییر دهید و دوباره امتحان کنید.</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseCardAccent} />
                <Text style={styles.exerciseName}>{item.name}</Text>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataText}>{translatedLabel(CATEGORY_LABELS, item.category, "دسته‌بندی دیگر")}</Text>
                  <View style={styles.metadataDot} />
                  <Text style={styles.metadataText}>{translatedLabel(LEVEL_LABELS, item.level, "سطح نامشخص")}</Text>
                </View>
                <Text style={styles.equipmentText}>{translatedLabel(EQUIPMENT_LABELS, item.equipment, "بدون تجهیزات مشخص")}</Text>
              </View>
            )}
          />
        )}
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  title: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.display.fontSize,
    lineHeight: theme.typography.display.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  searchInput: {
    minHeight: 52,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  exerciseCard: {
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  exerciseCardAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 3,
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  exerciseName: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: theme.spacing.xs,
  },
  metadataText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  metadataDot: {
    width: 4,
    height: 4,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  equipmentText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  stateTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
  stateText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "center",
    writingDirection: "rtl",
  },
  retryButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
  },
});
