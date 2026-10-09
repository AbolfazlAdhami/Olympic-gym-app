import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS } from "@gym-app/shared";
import { getDatabase } from "../../database/client";
import { theme } from "../../theme/tokens";
import { useRouter } from "expo-router";

interface ExerciseDatabaseRow {
  id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
  images_json: string;
}

interface ExerciseListItem {
  id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
  imageUrl: string | null;
}

interface ExerciseCardProps {
  item: ExerciseListItem;
}

function translatedLabel(labels: Readonly<Record<string, string>>, value: string | null, fallback: string): string {
  if (value === null) {
    return fallback;
  }

  return labels[value] ?? value;
}

const EXERCISE_IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

function resolveImageUrl(imagePath: string): string | null {
  const trimmedPath = imagePath.trim();

  if (/^https?:\/\//i.test(trimmedPath)) {
    return trimmedPath;
  }

  const normalizedPath = trimmedPath.replace(/\\/g, "/").replace(/^\.\/+/, "");
  const pathSegments = normalizedPath.split("/");

  if (normalizedPath.length === 0 || normalizedPath.startsWith("/") || pathSegments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) {
    return null;
  }

  const encodedPath = pathSegments.map(encodeURIComponent).join("/");
  return `${EXERCISE_IMAGE_BASE_URL}${encodedPath}`;
}

function firstImageUrl(imagesJson: string): string | null {
  try {
    const parsedImages: unknown = JSON.parse(imagesJson);

    if (!Array.isArray(parsedImages)) {
      return null;
    }

    for (const imagePath of parsedImages) {
      if (typeof imagePath !== "string") {
        continue;
      }

      const imageUrl = resolveImageUrl(imagePath);

      if (imageUrl !== null) {
        return imageUrl;
      }
    }
  } catch (error: unknown) {
    console.warn("An exercise image list could not be parsed.", error);
  }

  return null;
}

function ExerciseCard({ item }: ExerciseCardProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable
      accessibilityHint="نمایش جزئیات و نحوهٔ اجرای تمرین"
      accessibilityLabel={`جزئیات تمرین ${item.name}`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: item.id } })}
      style={({ pressed }) => [styles.exerciseCard, pressed && styles.exerciseCardPressed]}
    >
      {item.imageUrl !== null && !imageFailed ? (
        <Image accessibilityLabel={`تصویر ${item.name}`} cachePolicy="disk" contentFit="cover" onError={() => setImageFailed(true)} source={{ uri: item.imageUrl }} style={styles.exerciseImage} transition={180} />
      ) : (
        <View accessibilityLabel="تصویر تمرین در دسترس نیست" style={styles.imageFallback}>
          <Ionicons color={theme.colors.primary} name="barbell-outline" size={26} />
        </View>
      )}

      <View style={styles.exerciseContent}>
        <Text numberOfLines={2} style={styles.exerciseName}>
          {item.name}
        </Text>

        <View style={styles.metadataRow}>
          <Text numberOfLines={1} style={styles.metadataText}>
            {translatedLabel(CATEGORY_LABELS, item.category, "دسته‌بندی دیگر")}
          </Text>
          <View style={styles.metadataDot} />
          <Text style={styles.metadataText}>{translatedLabel(LEVEL_LABELS, item.level, "سطح نامشخص")}</Text>
        </View>

        <Text numberOfLines={1} style={styles.equipmentText}>
          {translatedLabel(EQUIPMENT_LABELS, item.equipment, "بدون تجهیزات مشخص")}
        </Text>
      </View>
    </Pressable>
  );
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
        const rows = await database.getAllAsync<ExerciseDatabaseRow>(
          `SELECT id, name, category, level, equipment, images_json
           FROM exercises
           ORDER BY name COLLATE NOCASE`,
        );

        const items: ExerciseListItem[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          level: row.level,
          equipment: row.equipment,
          imageUrl: firstImageUrl(row.images_json),
        }));
        if (isMounted) {
          setExercises(items);
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
            renderItem={({ item }) => <ExerciseCard item={item} />}
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
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  exerciseCardPressed: {
    borderColor: theme.colors.primary,
    opacity: 0.82,
  },
  exerciseImage: {
    width: 82,
    height: 82,
    marginLeft: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceRaised,
  },
  imageFallback: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceRaised,
  },
  exerciseContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  exerciseName: {
    alignSelf: "stretch",
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  metadataRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: theme.spacing.xs,
  },
  metadataText: {
    flexShrink: 1,
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
    alignSelf: "stretch",
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
