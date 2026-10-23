import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EXERCISE_CATEGORIES } from "@gym-app/shared";
import type { ExerciseCategory } from "@gym-app/shared";
import { getDatabase } from "../../database/client";
import { getActiveProfile } from "../../database/profileRepository";
import { theme } from "../../theme/tokens";
import { getExerciseLabel } from "../../types/exercise-labels.fa";

interface CategorySummary {
  category: ExerciseCategory;
  count: number;
}

interface CountRow {
  count: number;
}

interface CategoryCountRow {
  category: string;
  count: number;
}

function isExerciseCategory(value: string): value is ExerciseCategory {
  return EXERCISE_CATEGORIES.some((category) => category === value);
}

export default function HomeScreen() {
  const router = useRouter();
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [topCategories, setTopCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const loadSummary = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setHasError(false);

    try {
      const database = await getDatabase();
      const profile = await getActiveProfile(database);

      if (profile === null) {
        router.replace("/onboarding");
        return;
      }

      const [countRow, categoryTotalRow, categoryRows] = await Promise.all([
        database.getFirstAsync<CountRow>("SELECT COUNT(*) AS count FROM exercises"),
        database.getFirstAsync<CountRow>("SELECT COUNT(DISTINCT category) AS count FROM exercises"),
        database.getAllAsync<CategoryCountRow>(
          `SELECT category, COUNT(*) AS count
           FROM exercises
           GROUP BY category
           ORDER BY count DESC, category COLLATE NOCASE
           LIMIT 4`,
        ),
      ]);

      const validCategories = categoryRows.flatMap((row): CategorySummary[] =>
        isExerciseCategory(row.category) ? [{ category: row.category, count: row.count }] : [],
      );

      setExerciseCount(countRow?.count ?? 0);
      setCategoryCount(categoryTotalRow?.count ?? 0);
      setTopCategories(validCategories);
    } catch (error: unknown) {
      console.error("Home summary could not be loaded.", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, reloadKey]);

  function openExercises(): void {
    router.navigate("/(tabs)/exercises");
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image accessibilityLabel="نشان OLYMPIC" resizeMode="contain" source={require("../../../assets/icon.png")} style={styles.brandIcon} />
          <View style={styles.brandText}>
            <Text style={styles.brandName}>OLYMPIC</Text>
            <Text style={styles.brandCaption}>تمرین، با برنامه</Text>
          </View>
          <View style={styles.offlineBadge}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>آفلاین</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons color={theme.colors.background} name="barbell" size={22} />
          </View>
          <Text style={styles.eyebrow}>کتابخانهٔ تمرین فارسی</Text>
          <Text style={styles.headline}>تمرین بعدی‌ات{`\n`}از اینجا شروع می‌شود.</Text>
          <Text style={styles.description}>حرکت‌ها را پیدا کن، روش اجرای درست را ببین و با آگاهی تمرین کن.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={openExercises}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>رفتن به تمرین‌ها</Text>
            <Ionicons color={theme.colors.background} name="arrow-back" size={18} />
          </Pressable>
        </View>

        <View accessibilityLabel="خلاصهٔ کتابخانه" style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>حرکت در کتابخانه</Text>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Text style={styles.statValue}>{hasError ? "—" : (exerciseCount ?? 0).toLocaleString("en-US")}</Text>
            )}
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>دستهٔ فعال</Text>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <Text style={styles.statValue}>{hasError ? "—" : String(categoryCount ?? 0).padStart(2, "0")}</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>پرتکرارترین دسته‌ها</Text>
            <Text style={styles.sectionSubtitle}>بر اساس تعداد حرکت‌های ثبت‌شده</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={openExercises} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>همه</Text>
            <Ionicons color={theme.colors.primary} name="chevron-back" size={15} />
          </Pressable>
        </View>

        {hasError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>خلاصهٔ کتابخانه بارگذاری نشد.</Text>
            <Pressable accessibilityRole="button" onPress={() => setReloadKey((current) => current + 1)}>
              <Text style={styles.retryText}>تلاش دوباره</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : topCategories.length > 0 ? (
          <View style={styles.categoryGrid}>
            {topCategories.map((item, index) => (
              <View key={item.category} style={styles.categoryCard}>
                <View style={styles.categoryCardTop}>
                  <View style={[styles.categoryIcon, index === 0 && styles.categoryIconActive]}>
                    <Ionicons color={index === 0 ? theme.colors.primary : theme.colors.textMuted} name="fitness-outline" size={18} />
                  </View>
                  <Text style={styles.categoryIndex}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <Text numberOfLines={1} style={styles.categoryTitle}>{getExerciseLabel("category", item.category)}</Text>
                <Text style={styles.categoryCount}>{item.count.toLocaleString("en-US")} حرکت</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>هنوز حرکتی در کتابخانه ثبت نشده است.</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons color={theme.colors.primary} name="shield-checkmark-outline" size={16} />
          <Text style={styles.footerText}>تمرین‌ها و توضیحات روی دستگاهت در دسترس‌اند.</Text>
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.huge,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
  },
  brandText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  brandName: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: 13,
    letterSpacing: 2,
  },
  brandCaption: {
    marginTop: 2,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  offlineDot: {
    width: 7,
    height: 7,
    marginRight: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  offlineText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  hero: {
    overflow: "hidden",
    marginBottom: theme.spacing.md,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surfaceRaised,
  },
  heroIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  eyebrow: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  headline: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: 30,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
  },
  description: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  primaryButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  primaryButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
    opacity: 0.9,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  statsRow: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  statLabel: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  statValue: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.title.fontSize,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionSubtitle: {
    marginTop: 4,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48.5%",
    minHeight: 132,
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  categoryCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
  },
  categoryIconActive: {
    backgroundColor: theme.colors.primaryMuted,
  },
  categoryIndex: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
  },
  categoryTitle: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  categoryCount: {
    marginTop: theme.spacing.xxs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  loadingCard: {
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  errorCard: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  retryText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  emptyCard: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  emptyText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
});
