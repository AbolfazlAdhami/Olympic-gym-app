import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CATEGORY_LABELS, EQUIPMENT_LABELS, FORCE_LABELS, LEVEL_LABELS, MECHANIC_LABELS, MUSCLE_LABELS } from "@gym-app/shared";
import { getDatabase } from "../../database/client";
import { theme } from "../../theme/tokens";

interface ExerciseDatabaseRow {
  id: string;
  name: string;
  category: string;
  level: string;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  instructions_json: string;
  images_json: string;
}

interface MuscleDatabaseRow {
  muscle: string;
  role: string;
}

interface ExerciseDetail {
  id: string;
  name: string;
  category: string;
  level: string;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  instructions: string[];
  imageUrls: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

type LoadState = "loading" | "ready" | "error";

const EXERCISE_IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

function translatedLabel(labels: Readonly<Record<string, string>>, value: string | null, fallback: string): string {
  if (value === null) {
    return fallback;
  }

  return labels[value] ?? value;
}

function parseStringArray(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item: unknown): item is string => typeof item === "string");
  } catch (error: unknown) {
    console.warn("Exercise detail data could not be parsed.", error);
    return [];
  }
}

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

function parseImageUrls(imagesJson: string): string[] {
  return parseStringArray(imagesJson)
    .map(resolveImageUrl)
    .filter((url): url is string => url !== null);
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageCycling, setIsImageCycling] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadExercise(): Promise<void> {
      setLoadState("loading");

      try {
        const database = await getDatabase();
        const row = await database.getFirstAsync<ExerciseDatabaseRow>(
          `SELECT
             id,
             name,
             category,
             level,
             force,
             mechanic,
             equipment,
             instructions_json,
             images_json
           FROM exercises
           WHERE id = ?`,
          id,
        );

        if (row === null) {
          throw new Error(`Exercise not found: ${id}`);
        }

        const muscleRows = await database.getAllAsync<MuscleDatabaseRow>(
          `SELECT muscle, role
           FROM exercise_muscles
           WHERE exercise_id = ?
           ORDER BY role, muscle`,
          id,
        );

        const exerciseDetail: ExerciseDetail = {
          id: row.id,
          name: row.name,
          category: row.category,
          level: row.level,
          force: row.force,
          mechanic: row.mechanic,
          equipment: row.equipment,
          instructions: parseStringArray(row.instructions_json),
          imageUrls: parseImageUrls(row.images_json),
          primaryMuscles: muscleRows.filter((muscle) => muscle.role === "primary").map((muscle) => muscle.muscle),
          secondaryMuscles: muscleRows.filter((muscle) => muscle.role === "secondary").map((muscle) => muscle.muscle),
        };

        if (isMounted) {
          setDetail(exerciseDetail);
          setImageIndex(0);
          setLoadState("ready");
        }
      } catch (error: unknown) {
        console.error("Exercise detail could not be loaded.", error);

        if (isMounted) {
          setLoadState("error");
        }
      }
    }

    void loadExercise();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const imageCount = detail?.imageUrls.length ?? 0;
  const currentImageUrl = detail?.imageUrls[imageIndex] ?? null;

  useEffect(() => {
    if (imageCount < 2 || !isImageCycling) {
      return;
    }

    const intervalId = setInterval(() => {
      setImageIndex((currentIndex) => (currentIndex + 1) % imageCount);
    }, 2400);

    return () => {
      clearInterval(intervalId);
    };
  }, [imageCount, isImageCycling]);

  useEffect(() => {
    setImageFailed(false);
  }, [currentImageUrl]);

  function showPreviousImage(): void {
    if (imageCount < 2) {
      return;
    }

    setIsImageCycling(false);
    setImageIndex((currentIndex) => (currentIndex - 1 + imageCount) % imageCount);
  }

  function showNextImage(): void {
    if (imageCount < 2) {
      return;
    }

    setIsImageCycling(false);
    setImageIndex((currentIndex) => (currentIndex + 1) % imageCount);
  }

  if (loadState === "loading") {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>در حال بارگذاری جزئیات تمرین</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadState === "error" || detail === null) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Pressable accessibilityLabel="بازگشت" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={theme.colors.text} name="chevron-forward" size={24} />
          </Pressable>
          <Text style={styles.errorTitle}>تمرین بارگذاری نشد</Text>
          <Text style={styles.stateText}>دوباره تلاش کنید یا به فهرست تمرین‌ها برگردید.</Text>
          <Pressable accessibilityRole="button" onPress={() => setReloadKey((current) => current + 1)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>تلاش دوباره</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="بازگشت به فهرست تمرین‌ها" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={theme.colors.text} name="chevron-forward" size={24} />
          </Pressable>
          <Text style={styles.topBarTitle}>جزئیات تمرین</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.gallery}>
          {currentImageUrl !== null && !imageFailed ? (
            <Image accessibilityLabel={`تصویر ${detail.name}`} cachePolicy="disk" contentFit="cover" onError={() => setImageFailed(true)} source={{ uri: currentImageUrl }} style={styles.galleryImage} transition={260} />
          ) : (
            <View style={styles.galleryFallback}>
              <Ionicons color={theme.colors.primary} name="barbell-outline" size={54} />
              <Text style={styles.galleryFallbackText}>تصویر تمرین در دسترس نیست</Text>
            </View>
          )}

          {imageCount > 1 ? (
            <>
              <Pressable accessibilityLabel="تصویر قبلی" accessibilityRole="button" onPress={showPreviousImage} style={[styles.galleryButton, styles.previousButton]}>
                <Ionicons color={theme.colors.text} name="chevron-forward" size={22} />
              </Pressable>

              <Pressable accessibilityLabel="تصویر بعدی" accessibilityRole="button" onPress={showNextImage} style={[styles.galleryButton, styles.nextButton]}>
                <Ionicons color={theme.colors.text} name="chevron-back" size={22} />
              </Pressable>

              <View style={styles.galleryFooter}>
                <Pressable
                  accessibilityLabel={isImageCycling ? "توقف نمایش خودکار تصاویر" : "پخش خودکار تصاویر"}
                  accessibilityRole="button"
                  onPress={() => setIsImageCycling((current) => !current)}
                  style={styles.playButton}
                >
                  <Ionicons color={theme.colors.text} name={isImageCycling ? "pause" : "play"} size={15} />
                </Pressable>

                <Text style={styles.imageCounter}>
                  {String(imageIndex + 1).padStart(2, "0")} / {String(imageCount).padStart(2, "0")}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.categoryLabel}>{translatedLabel(CATEGORY_LABELS, detail.category, "دسته‌بندی دیگر")}</Text>
          <Text style={styles.exerciseTitle}>{detail.name}</Text>
        </View>

        <View style={styles.metadataGrid}>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>سطح</Text>
            <Text style={styles.metadataValue}>{translatedLabel(LEVEL_LABELS, detail.level, "نامشخص")}</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>تجهیزات</Text>
            <Text style={styles.metadataValue}>{translatedLabel(EQUIPMENT_LABELS, detail.equipment, "بدون تجهیزات مشخص")}</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>نوع حرکت</Text>
            <Text style={styles.metadataValue}>{translatedLabel(FORCE_LABELS, detail.force, "نامشخص")}</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>مکانیک</Text>
            <Text style={styles.metadataValue}>{translatedLabel(MECHANIC_LABELS, detail.mechanic, "نامشخص")}</Text>
          </View>
        </View>

        {detail.primaryMuscles.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عضلات اصلی</Text>
            <View style={styles.muscleList}>
              {detail.primaryMuscles.map((muscle) => (
                <View key={`primary-${muscle}`} style={styles.muscleChip}>
                  <Text style={styles.muscleChipText}>{translatedLabel(MUSCLE_LABELS, muscle, muscle)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {detail.secondaryMuscles.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>عضلات کمکی</Text>
            <View style={styles.muscleList}>
              {detail.secondaryMuscles.map((muscle) => (
                <View key={`secondary-${muscle}`} style={styles.muscleChipMuted}>
                  <Text style={styles.muscleChipText}>{translatedLabel(MUSCLE_LABELS, muscle, muscle)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نحوهٔ اجرا</Text>
          {detail.instructions.length > 0 ? (
            detail.instructions.map((instruction, index) => (
              <View key={`${detail.id}-step-${index}`} style={styles.instructionRow}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.stateText}>دستور اجرایی برای این تمرین ثبت نشده است.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  topBarTitle: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  topBarSpacer: {
    width: 42,
    height: 42,
  },
  gallery: {
    position: "relative",
    overflow: "hidden",
    height: 280,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  galleryFallbackText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  galleryButton: {
    position: "absolute",
    top: "45%",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(16, 19, 16, 0.78)",
  },
  previousButton: {
    right: theme.spacing.sm,
  },
  nextButton: {
    left: theme.spacing.sm,
  },
  galleryFooter: {
    position: "absolute",
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(16, 19, 16, 0.82)",
  },
  playButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceRaised,
  },
  imageCounter: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
  },
  titleBlock: {
    marginTop: theme.spacing.xl,
    alignItems: "flex-end",
  },
  categoryLabel: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  exerciseTitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  metadataGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  metadataCard: {
    width: "48%",
    minHeight: 76,
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  metadataLabel: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  metadataValue: {
    marginTop: theme.spacing.xxs,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  muscleList: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  muscleChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
  },
  muscleChipMuted: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  muscleChipText: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  instructionRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  instructionNumber: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
  },
  instructionNumberText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
  },
  instructionText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    marginTop: theme.spacing.xl,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
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
