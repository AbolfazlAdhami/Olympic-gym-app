import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDatabase } from "../../database/client";
import { listFavoriteExercises, removeExerciseFromFavorites, type ExerciseListItem } from "../../database/exerciseRepository";
import { deleteLocalProfile, getActiveProfile, type LocalProfile } from "../../database/profileRepository";
import { resolveExerciseMediaUrl } from "../../utils/exerciseMedia";
import { getExerciseLabel } from "../../types/exercise-labels.fa";
import { theme } from "../../theme/tokens";

interface FavoriteExercise extends ExerciseListItem {
  imageAsset: string | null;
}

interface FavoriteRowProps {
  item: FavoriteExercise;
  onOpen: (exerciseId: string) => void;
  onRemove: (exerciseId: string) => void;
  removing: boolean;
}

const FavoriteRow = memo(function FavoriteRow({ item, onOpen, onRemove, removing }: FavoriteRowProps) {
  return (
    <View style={styles.favoriteCard}>
      <Pressable accessibilityHint="نمایش جزئیات حرکت" accessibilityLabel={`نمایش حرکت ${item.name}`} accessibilityRole="button" onPress={() => onOpen(item.id)} style={styles.favoriteMain}>
        {item.imageAsset !== null ? (
          <Image accessibilityLabel={`تصویر ${item.name}`} contentFit="cover" source={item.imageAsset} style={styles.favoriteImage} />
        ) : (
          <View style={[styles.favoriteImage, styles.favoriteImageFallback]}>
            <Ionicons color={theme.colors.primary} name="barbell-outline" size={21} />
          </View>
        )}
        <View style={styles.favoriteTextBlock}>
          <Text numberOfLines={2} style={styles.favoriteTitle}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={styles.favoriteMetadata}>
            {getExerciseLabel("category", item.category)} · {getExerciseLabel("target", item.target)}
          </Text>
        </View>
      </Pressable>
      <Pressable accessibilityLabel={`حذف ${item.name} از علاقه‌مندی‌ها`} accessibilityRole="button" disabled={removing} onPress={() => onRemove(item.id)} style={styles.removeButton}>
        {removing ? <ActivityIndicator color={theme.colors.danger} size="small" /> : <Ionicons color={theme.colors.danger} name="heart-dislike-outline" size={20} />}
      </Pressable>
    </View>
  );
});

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadProfile(): Promise<void> {
        setIsLoading(true);
        setHasError(false);

        try {
          const database = await getDatabase();
          const activeProfile = await getActiveProfile(database);

          if (activeProfile === null) {
            router.replace("/onboarding");
            return;
          }

          const favoriteRows = await listFavoriteExercises(database, activeProfile.id);
          const favoriteItems: FavoriteExercise[] = favoriteRows.map((favorite) => ({
            ...favorite,
            imageAsset: resolveExerciseMediaUrl(favorite.image),
          }));

          if (isActive) {
            setProfile(activeProfile);
            setFavorites(favoriteItems);
          }
        } catch (error: unknown) {
          console.error("Local profile could not be loaded.", error);

          if (isActive) {
            setHasError(true);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      void loadProfile();

      return () => {
        isActive = false;
      };
    }, [reloadKey, router]),
  );

  const removeFavorite = useCallback(
    async (exerciseId: string): Promise<void> => {
      if (profile === null) {
        return;
      }

      setRemovingId(exerciseId);

      try {
        const database = await getDatabase();
        await removeExerciseFromFavorites(database, profile.id, exerciseId);
        setFavorites((current) => current.filter((favorite) => favorite.id !== exerciseId));
      } catch (error: unknown) {
        console.error("Favorite exercise could not be removed.", error);
        Alert.alert("حذف انجام نشد", "حرکت از علاقه‌مندی‌ها حذف نشد. دوباره تلاش کنید.");
      } finally {
        setRemovingId(null);
      }
    },
    [profile],
  );

  const openExercise = useCallback(
    (exerciseId: string): void => {
      router.push({ pathname: "/exercise/[id]", params: { id: exerciseId } });
    },
    [router],
  );
  const handleRemoveFavorite = useCallback(
    (exerciseId: string): void => {
      void removeFavorite(exerciseId);
    },
    [removeFavorite],
  );

  const deleteProfile = useCallback(async (): Promise<void> => {
    if (profile === null) {
      return;
    }

    setIsDeletingProfile(true);

    try {
      const database = await getDatabase();
      await deleteLocalProfile(database, profile.id);
      router.replace("/onboarding");
    } catch (error: unknown) {
      console.error("Local profile could not be deleted.", error);
      Alert.alert("حذف انجام نشد", "پروفایل حذف نشد. دوباره تلاش کنید.");
    } finally {
      setIsDeletingProfile(false);
    }
  }, [profile, router]);

  const confirmProfileDeletion = useCallback((): void => {
    if (profile === null || isDeletingProfile) {
      return;
    }

    Alert.alert("حذف پروفایل محلی؟", "پروفایل و حرکت‌های موردعلاقهٔ این کاربر از این دستگاه حذف می‌شوند. سپس می‌توانی دوباره ثبت‌نام کنی.", [
      { text: "انصراف", style: "cancel" },
      { text: "حذف پروفایل", style: "destructive", onPress: () => void deleteProfile() },
    ]);
  }, [deleteProfile, isDeletingProfile, profile]);

  const openContactLink = useCallback(async (url: string, contactName: string): Promise<void> => {
    try {
      await Linking.openURL(url);
    } catch (error: unknown) {
      console.error(`The ${contactName} link could not be opened.`, error);
      Alert.alert("پیوند باز نشد", `امکان باز کردن ${contactName} وجود ندارد.`);
    }
  }, []);

  const renderFavorite = useCallback(
    ({ item }: { item: FavoriteExercise }) => <FavoriteRow item={item} onOpen={openExercise} onRemove={handleRemoveFavorite} removing={removingId === item.id} />,
    [handleRemoveFavorite, openExercise, removingId],
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={favorites}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.stateText}>در حال بارگذاری پروفایل</Text>
            </View>
          ) : hasError ? (
            <View style={styles.stateCard}>
              <Ionicons color={theme.colors.danger} name="alert-circle-outline" size={28} />
              <Text style={styles.stateText}>اطلاعات پروفایل بارگذاری نشد.</Text>
              <Pressable accessibilityRole="button" onPress={() => setReloadKey((current) => current + 1)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>تلاش دوباره</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons color={theme.colors.primary} name="heart-outline" size={26} />
              </View>
              <Text style={styles.emptyTitle}>هنوز حرکتی ذخیره نکرده‌ای</Text>
              <Text style={styles.emptyDescription}>در صفحهٔ هر تمرین، آن را به علاقه‌مندی‌ها اضافه کن تا اینجا ببینی.</Text>
              <Pressable accessibilityRole="button" onPress={() => router.navigate("/(tabs)/exercises")} style={styles.browseButton}>
                <Ionicons color={theme.colors.background} name="arrow-back" size={17} />
                <Text style={styles.browseButtonText}>گشتن در تمرین‌ها</Text>
              </Pressable>
            </View>
          )
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>فضای شخصی</Text>
            <Text style={styles.pageTitle}>پروفایل من</Text>
            {profile !== null ? (
              <>
                <View style={styles.profileCard}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileInitial}>{profile.displayName.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text numberOfLines={1} style={styles.profileName}>
                      {profile.displayName}
                    </Text>
                    <Text numberOfLines={1} style={styles.profileEmail}>
                      {profile.email}
                    </Text>
                    <View style={styles.localBadge}>
                      <Text style={styles.localBadgeText}>پروفایل محلی</Text>
                      <View style={styles.localDot} />
                    </View>
                  </View>
                  <Ionicons color={theme.colors.primary} name="person-circle-outline" size={24} />
                </View>

                <View style={styles.aboutCard}>
                  <View style={styles.aboutHeading}>
                    <View style={styles.aboutIcon}>
                      <Ionicons color={theme.colors.primary} name="code-slash-outline" size={21} />
                    </View>
                    <View style={styles.aboutText}>
                      <Text style={styles.aboutTitle}>ارتباط با برنامه نویس</Text>
                      <Text style={styles.aboutDescription}>برنامه‌نویس و سازندهٔ این اپلیکیشن</Text>
                    </View>
                    <Ionicons color={theme.colors.textSubtle} name="person-outline" size={20} />
                  </View>
                  <View style={styles.contactList}>
                    <Pressable
                      accessibilityHint="صفحهٔ تلگرام را باز می‌کند"
                      accessibilityLabel="تلگرام، آیدی Adhami_82"
                      accessibilityRole="button"
                      onPress={() => void openContactLink("https://t.me/Adhami_82", "تلگرام")}
                      style={styles.contactRow}
                    >
                      <Ionicons color={theme.colors.primary} name="paper-plane-outline" size={18} />
                      <Text style={styles.contactValue}>@Adhami_82</Text>
                      <Ionicons color={theme.colors.textSubtle} name="open-outline" size={15} />
                    </Pressable>
                    <Pressable
                      accessibilityHint="پروفایل LinkedIn را در مرورگر باز می‌کند"
                      accessibilityLabel="پروفایل LinkedIn ابوالفضل ادهمی"
                      accessibilityRole="button"
                      onPress={() => void openContactLink("https://www.linkedin.com/in/abolfazl-adhami-2a430b375", "LinkedIn")}
                      style={styles.contactRow}
                    >
                      <Ionicons color={theme.colors.primary} name="logo-linkedin" size={18} />
                      <Text numberOfLines={1} style={styles.contactValue}>
                        LinkedIn · abolfazl-adhami
                      </Text>
                      <Ionicons color={theme.colors.textSubtle} name="open-outline" size={15} />
                    </Pressable>
                  </View>
                </View>
              </>
            ) : null}
            <View style={styles.favoritesHeading}>
              <View style={styles.favoriteCountBadge}>
                <Text style={styles.favoriteCount}>{String(favorites.length).padStart(2, "0")}</Text>
              </View>
              <View style={styles.favoritesHeadingText}>
                <Text style={styles.sectionTitle}>حرکت‌های موردعلاقه</Text>
              </View>
            </View>
          </View>
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        renderItem={renderFavorite}
        showsVerticalScrollIndicator={false}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  pageTitle: {
    marginTop: theme.spacing.xxs,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.title.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  profileCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  },
  aboutCard: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  aboutHeading: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  aboutIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryMuted,
  },
  aboutText: {
    flex: 1,
    alignItems: "flex-end",
  },
  aboutTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  aboutDescription: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  contactList: {
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.sm,
  },
  contactRow: {
    minHeight: 42,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
  },
  contactValue: {
    flex: 1,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "ltr",
  },
  deleteProfileButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(255, 107, 107, 0.06)",
  },
  deleteProfileButtonPressed: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
  },
  deleteProfileButtonDisabled: {
    opacity: 0.65,
  },
  deleteProfileText: {
    flex: 1,
    alignItems: "flex-end",
  },
  deleteProfileTitle: {
    color: theme.colors.danger,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  deleteProfileDescription: {
    marginTop: 2,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: 10,
    textAlign: "right",
    writingDirection: "rtl",
  },
  profileAvatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
  },
  profileInitial: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.title.fontSize,
  },
  profileInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  profileName: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.subtitle.fontSize,
    writingDirection: "rtl",
  },
  profileEmail: {
    maxWidth: "100%",
    marginTop: 2,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
  },
  localBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceRaised,
  },
  localDot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondary,
  },
  localBadgeText: {
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: 10,
    writingDirection: "rtl",
  },
  favoritesHeading: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
  },
  favoriteCountBadge: {
    minWidth: 38,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
  },
  favoriteCount: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.caption.fontSize,
  },
  favoritesHeadingText: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    writingDirection: "rtl",
  },
  sectionCaption: {
    marginTop: 2,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  favoriteCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  favoriteMain: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  favoriteImage: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceRaised,
  },
  favoriteImageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteTextBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  favoriteTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  favoriteMetadata: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  removeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceRaised,
  },
  emptyCard: {
    flex: 1,
    minHeight: 250,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryMuted,
  },
  emptyTitle: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
  emptyDescription: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "center",
    writingDirection: "rtl",
  },
  browseButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  browseButtonText: {
    color: theme.colors.background,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  stateCard: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  },
  stateText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
  retryButton: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryMuted,
  },
  retryButtonText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
});
