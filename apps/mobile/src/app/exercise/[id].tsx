import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDatabase } from "../../database/client";
import { addExerciseToFavorites, getExerciseById, isExerciseFavorite, removeExerciseFromFavorites } from "../../database/exerciseRepository";
import { getActiveProfile } from "../../database/profileRepository";
import { resolveExerciseMediaUrl } from "../../utils/exerciseMedia";
import { theme } from "../../theme/tokens";
import { getExerciseLabel } from "../../types/exercise-labels.fa";

interface ExerciseDetail {
  id: string;
  name: string;
  category: string;
  bodyPart: string;
  equipment: string;
  instructions: string[];
  imageAsset: string | null;
  animationAsset: string | null;
  muscleGroup: string;
  secondaryMuscles: string[];
  target: string;
}

type LoadState = "loading" | "ready" | "error";
type MediaSelection = "animation" | "image";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaSelection>("animation");
  const [mediaFailed, setMediaFailed] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadExercise(): Promise<void> {
      setLoadState("loading");

      try {
        const database = await getDatabase();
        const profile = await getActiveProfile(database);

        if (profile === null) {
          router.replace("/onboarding");
          return;
        }

        const exercise = await getExerciseById(database, id);

        if (exercise === null) {
          throw new Error(`Exercise not found: ${id}`);
        }

        const exerciseDetail: ExerciseDetail = {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          bodyPart: exercise.bodyPart,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          imageAsset: resolveExerciseMediaUrl(exercise.image),
          animationAsset: resolveExerciseMediaUrl(exercise.gifUrl),
          muscleGroup: exercise.muscleGroup,
          secondaryMuscles: exercise.secondaryMuscles,
          target: exercise.target,
        };
        const favoriteState = await isExerciseFavorite(database, profile.id, exercise.id);

        if (isMounted) {
          setDetail(exerciseDetail);
          setSelectedMedia(exerciseDetail.animationAsset !== null ? "animation" : "image");
          setActiveUserId(profile.id);
          setIsFavorite(favoriteState);
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
  }, [id, reloadKey, router]);

  const currentMediaAsset = selectedMedia === "animation"
    ? detail?.animationAsset ?? detail?.imageAsset ?? null
    : detail?.imageAsset ?? detail?.animationAsset ?? null;
  const hasBothMedia = detail?.animationAsset !== null && detail?.imageAsset !== null;
  const currentMediaLabel = selectedMedia === "animation" ? "نمایش حرکت" : "تصویر ثابت";

  useEffect(() => {
    setMediaFailed(false);
  }, [currentMediaAsset]);

  function selectMedia(selection: MediaSelection): void {
    setSelectedMedia(selection);
    setMediaFailed(false);
  }

  async function toggleFavorite(): Promise<void> {
    if (activeUserId === null || detail === null) {
      return;
    }

    setIsFavoriteUpdating(true);
    setFavoriteError(null);

    try {
      const database = await getDatabase();

      if (isFavorite) {
        await removeExerciseFromFavorites(database, activeUserId, detail.id);
        setIsFavorite(false);
      } else {
        await addExerciseToFavorites(database, activeUserId, detail.id);
        setIsFavorite(true);
      }
    } catch (error: unknown) {
      console.error("Exercise favorite state could not be updated.", error);
      setFavoriteError("ذخیرهٔ علاقه‌مندی انجام نشد. دوباره تلاش کنید.");
    } finally {
      setIsFavoriteUpdating(false);
    }
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
          <Text style={styles.topBarTitle}>راهنمای حرکت</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.mediaFrame}>
          {currentMediaAsset !== null && !mediaFailed ? (
            <Image
              accessibilityLabel={`${currentMediaLabel} ${detail.name}`}
              contentFit="contain"
              onError={() => setMediaFailed(true)}
              source={currentMediaAsset}
              style={styles.mediaImage}
              transition={200}
            />
          ) : (
            <View style={styles.mediaFallback}>
              <Ionicons color={theme.colors.primary} name="barbell-outline" size={52} />
              <Text style={styles.mediaFallbackText}>رسانهٔ این حرکت در دسترس نیست</Text>
            </View>
          )}
          <View style={styles.mediaBadge}>
            <View style={styles.mediaBadgeDot} />
            <Text style={styles.mediaBadgeText}>{currentMediaLabel}</Text>
          </View>
        </View>

        {hasBothMedia ? (
          <View accessibilityRole="tablist" style={styles.mediaSelector}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedMedia === "animation" }}
              onPress={() => selectMedia("animation")}
              style={[styles.mediaOption, selectedMedia === "animation" && styles.mediaOptionSelected]}
            >
              <Ionicons color={selectedMedia === "animation" ? theme.colors.background : theme.colors.textMuted} name="play-circle-outline" size={17} />
              <Text style={[styles.mediaOptionText, selectedMedia === "animation" && styles.mediaOptionTextSelected]}>نمایش حرکت</Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedMedia === "image" }}
              onPress={() => selectMedia("image")}
              style={[styles.mediaOption, selectedMedia === "image" && styles.mediaOptionSelected]}
            >
              <Ionicons color={selectedMedia === "image" ? theme.colors.background : theme.colors.textMuted} name="image-outline" size={17} />
              <Text style={[styles.mediaOptionText, selectedMedia === "image" && styles.mediaOptionTextSelected]}>تصویر ثابت</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.titleBlock}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryLabel}>{getExerciseLabel("category", detail.category)}</Text>
          </View>
          <Text style={styles.exerciseTitle}>{detail.name}</Text>
          <Text style={styles.exerciseSubtitle}>راهنمای اجرای حرکت و عضلات درگیر</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite, disabled: isFavoriteUpdating }}
          disabled={isFavoriteUpdating}
          onPress={() => void toggleFavorite()}
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonSelected, isFavoriteUpdating && styles.favoriteButtonDisabled]}
        >
          {isFavoriteUpdating ? (
            <ActivityIndicator color={isFavorite ? theme.colors.primary : theme.colors.textMuted} size="small" />
          ) : (
            <Ionicons color={isFavorite ? theme.colors.primary : theme.colors.textMuted} name={isFavorite ? "heart" : "heart-outline"} size={20} />
          )}
          <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextSelected]}>
            {isFavorite ? "ذخیره‌شده در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          </Text>
        </Pressable>
        {favoriteError !== null ? <Text accessibilityRole="alert" style={styles.favoriteError}>{favoriteError}</Text> : null}

        <View style={styles.targetCard}>
          <View style={styles.targetIcon}>
            <Ionicons color={theme.colors.primary} name="locate-outline" size={20} />
          </View>
          <View style={styles.targetTextBlock}>
            <Text style={styles.targetLabel}>هدف اصلی</Text>
            <Text style={styles.targetValue}>{getExerciseLabel("target", detail.target)}</Text>
          </View>
          <Ionicons color={theme.colors.textSubtle} name="arrow-back" size={17} />
        </View>

        <View style={styles.metadataGrid}>
          <View style={styles.metadataCard}>
            <View style={styles.metadataIcon}>
              <Ionicons color={theme.colors.secondary} name="body-outline" size={18} />
            </View>
            <Text style={styles.metadataLabel}>بخش بدن</Text>
            <Text style={styles.metadataValue}>{getExerciseLabel("body_part", detail.bodyPart)}</Text>
          </View>
          <View style={styles.metadataCard}>
            <View style={styles.metadataIcon}>
              <Ionicons color={theme.colors.secondary} name="barbell-outline" size={18} />
            </View>
            <Text style={styles.metadataLabel}>تجهیزات</Text>
            <Text numberOfLines={2} style={styles.metadataValue}>{getExerciseLabel("equipment", detail.equipment)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>عضلات درگیر</Text>
            <Ionicons color={theme.colors.primary} name="fitness-outline" size={20} />
          </View>
          <Text style={styles.sectionCaption}>عضلهٔ اصلی</Text>
          <View style={styles.muscleList}>
            <View style={styles.muscleChipPrimary}>
              <Text style={styles.muscleChipPrimaryText}>{getExerciseLabel("muscle", detail.muscleGroup)}</Text>
            </View>
          </View>

          {detail.secondaryMuscles.length > 0 ? (
            <>
              <Text style={styles.sectionCaptionSecondary}>عضلات کمکی</Text>
              <View style={styles.muscleList}>
                {detail.secondaryMuscles.map((muscle) => (
                  <View key={`secondary-${muscle}`} style={styles.muscleChip}>
                    <Text style={styles.muscleChipText}>{getExerciseLabel("muscle", muscle)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>مراحل اجرا</Text>
            <View style={styles.stepCountBadge}>
              <Text style={styles.stepCountText}>{detail.instructions.length} مرحله</Text>
            </View>
          </View>
          {detail.instructions.length > 0 ? (
            detail.instructions.map((instruction, index) => (
              <View key={`${detail.id}-step-${index}`} style={styles.instructionRow}>
                <View style={styles.instructionRail}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{String(index + 1).padStart(2, "0")}</Text>
                  </View>
                  {index < detail.instructions.length - 1 ? <View style={styles.instructionConnector} /> : null}
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyInstructions}>
              <Text style={styles.emptyInstructionsText}>مراحل اجرای این حرکت ثبت نشده است.</Text>
            </View>
          )}
        </View>

        <View style={styles.offlineNote}>
          <Ionicons color={theme.colors.primary} name="cloud-offline-outline" size={17} />
          <Text style={styles.offlineNoteText}>این راهنما روی دستگاه ذخیره است و آفلاین هم در دسترس می‌ماند.</Text>
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
  mediaFrame: {
    position: "relative",
    overflow: "hidden",
    height: 270,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: "#0B0D0B",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  mediaFallbackText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  mediaBadge: {
    position: "absolute",
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(16, 19, 16, 0.84)",
  },
  mediaBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  mediaBadgeText: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  mediaSelector: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.xxs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  mediaOption: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  mediaOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  mediaOptionText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  mediaOptionTextSelected: {
    color: theme.colors.background,
  },
  titleBlock: {
    alignItems: "flex-end",
    marginTop: theme.spacing.xl,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
  },
  categoryLabel: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  exerciseTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.title.fontSize,
    lineHeight: theme.typography.title.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  exerciseSubtitle: {
    marginTop: theme.spacing.xxs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  favoriteButton: {
    minHeight: 48,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  favoriteButtonSelected: {
    borderColor: theme.colors.primaryMuted,
    backgroundColor: theme.colors.primaryMuted,
  },
  favoriteButtonDisabled: {
    opacity: 0.7,
  },
  favoriteButtonText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  favoriteButtonTextSelected: {
    color: theme.colors.primary,
  },
  favoriteError: {
    marginTop: theme.spacing.xs,
    color: theme.colors.danger,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  targetCard: {
    minHeight: 72,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  targetIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryMuted,
  },
  targetTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  targetLabel: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  targetValue: {
    marginTop: 2,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  metadataGrid: {
    flexDirection: "row-reverse",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  metadataCard: {
    flex: 1,
    minHeight: 112,
    alignItems: "flex-end",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  metadataIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
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
    marginTop: theme.spacing.xxl,
  },
  sectionHeading: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionCaption: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionCaptionSecondary: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  muscleList: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  muscleChipPrimary: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
  },
  muscleChipPrimaryText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  muscleChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  muscleChipText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  stepCountBadge: {
    marginRight: "auto",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceRaised,
  },
  stepCountText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  instructionRow: {
    flexDirection: "row-reverse",
    alignItems: "stretch",
    minHeight: 56,
  },
  instructionRail: {
    alignItems: "center",
    marginLeft: theme.spacing.sm,
  },
  instructionNumber: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
  },
  instructionNumberText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
  },
  instructionConnector: {
    flex: 1,
    width: 1,
    marginVertical: theme.spacing.xxs,
    backgroundColor: theme.colors.border,
  },
  instructionText: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  emptyInstructions: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  emptyInstructionsText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  offlineNote: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  offlineNoteText: {
    flexShrink: 1,
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
