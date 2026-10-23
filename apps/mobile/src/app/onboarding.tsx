import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDatabase } from "../database/client";
import { ProfileAlreadyExistsError, ProfileInputError, registerLocalProfile } from "../database/profileRepository";
import { theme } from "../theme/tokens";

export default function OnboardingScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createProfile(): Promise<void> {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const database = await getDatabase();
      await registerLocalProfile(database, { displayName, email });
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (error instanceof ProfileInputError || error instanceof ProfileAlreadyExistsError) {
        setErrorMessage(error.message);
      } else {
        console.error("Local profile registration failed.", error);
        setErrorMessage("ثبت پروفایل انجام نشد. دوباره تلاش کنید.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardContainer}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <Image accessibilityLabel="نشان OLYMPIC" resizeMode="contain" source={require("../../assets/icon.png")} style={styles.brandIcon} />
            <View>
              <Text style={styles.brandName}>OLYMPIC</Text>
              <Text style={styles.brandCaption}>راهنمای تمرین تو</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroMark}>
              <Ionicons color={theme.colors.background} name="barbell" size={30} />
            </View>
            <Text style={styles.eyebrow}>به جمع ما خوش آمدی</Text>
            <Text style={styles.title}>تمرین آگاهانه،{`\n`}از همین‌جا شروع می‌شود.</Text>
            <Text style={styles.description}>حرکت‌ها را با راهنمای فارسی و نمایش تصویری یاد بگیر، عضلات درگیر را بشناس و تمرین‌های محبوبت را همیشه دم دست داشته باش.</Text>
          </View>

          <View style={styles.benefitList}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons color={theme.colors.primary} name="book-outline" size={18} />
              </View>
              <Text style={styles.benefitText}>کتابخانهٔ حرکت‌ها و مراحل اجرای فارسی</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons color={theme.colors.primary} name="phone-portrait-outline" size={18} />
              </View>
              <Text style={styles.benefitText}>دسترسی آفلاین به راهنمای تمرین</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons color={theme.colors.primary} name="heart-outline" size={18} />
              </View>
              <Text style={styles.benefitText}>نگهداری حرکت‌های موردعلاقه در پروفایل</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>پروفایل اولیه‌ات را بساز</Text>
            <Text style={styles.formCaption}>این اطلاعات فقط برای پروفایل روی همین دستگاه است.</Text>

            <Text style={styles.inputLabel}>نام نمایشی</Text>
            <TextInput
              accessibilityLabel="نام نمایشی"
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={setDisplayName}
              placeholder="مثلاً علی رضایی"
              placeholderTextColor={theme.colors.textSubtle}
              returnKeyType="next"
              style={styles.input}
              textAlign="right"
              value={displayName}
            />

            <Text style={styles.inputLabel}>ایمیل</Text>
            <TextInput
              accessibilityLabel="ایمیل"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={theme.colors.textSubtle}
              returnKeyType="done"
              style={[styles.input, styles.emailInput]}
              textAlign="left"
              value={email}
            />

            {errorMessage !== null ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void createProfile()}
              style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed, isSubmitting && styles.submitButtonDisabled]}
            >
              {isSubmitting ? <ActivityIndicator color={theme.colors.background} size="small" /> : null}
              {!isSubmitting ? <Ionicons color={theme.colors.background} name="arrow-back" size={18} /> : null}
              <Text style={styles.submitButtonText}>{isSubmitting ? "در حال ساخت پروفایل" : "ساخت پروفایل و شروع"}</Text>
            </Pressable>

            <View style={styles.privacyNote}>
              <Ionicons color={theme.colors.textSubtle} name="lock-closed-outline" size={15} />
              <Text style={styles.privacyText}>ثبت‌نام ابری نیست؛ رمز عبوری ذخیره نمی‌شود.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  brandRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
  },
  brandName: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: 13,
    letterSpacing: 2,
    textAlign: "right",
  },
  brandCaption: {
    marginTop: 2,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  hero: {
    alignItems: "flex-end",
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surfaceRaised,
  },
  heroMark: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary,
  },
  eyebrow: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    writingDirection: "rtl",
  },
  title: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: 26,
    lineHeight: 40,
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
  benefitList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  benefitRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
  },
  benefitText: {
    flex: 1,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  formCard: {
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  },
  formTitle: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  formCaption: {
    marginTop: theme.spacing.xxs,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  inputLabel: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  input: {
    minHeight: 50,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
  },
  emailInput: {
    writingDirection: "ltr",
  },
  errorText: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.danger,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  submitButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  submitButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitButtonText: {
    color: theme.colors.background,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  privacyNote: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  privacyText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: 11,
    writingDirection: "rtl",
  },
});
