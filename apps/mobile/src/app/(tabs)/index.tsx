import { ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../theme/tokens";

const categories = [
  { id: "strength", title: "قدرتی", detail: "تمرین‌های قدرت و عضله" },
  { id: "stretching", title: "کششی", detail: "انعطاف و دامنهٔ حرکتی" },
  { id: "plyometrics", title: "پلایومتریک", detail: "سرعت و توان انفجاری" },
  { id: "strongman", title: "مردان آهنین", detail: "تمرین‌های قدرتی ویژه" },
  { id: "powerlifting", title: "پاورلیفتینگ", detail: "حرکات اصلی قدرتی" },
  { id: "cardio", title: "هوازی", detail: "تمرین‌های قلبی‌عروقی" },
  {
    id: "olympic-weightlifting",
    title: "وزنه‌برداری المپیکی",
    detail: "حرکات تخصصی وزنه‌برداری",
  },
] as const;

export default function HomeScreen() {
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
            <View style={styles.onlineDot} />
            <Text style={styles.offlineText}>آفلاین</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>کتابخانهٔ تمرین فارسی</Text>
          <Text style={styles.headline}>قوی‌تر شو،{`\n`}قدم‌به‌قدم.</Text>
          <Text style={styles.description}>حرکت مناسب هدفت را پیدا کن و تمرینت را آگاهانه پیش ببر.</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureAccent} />
          <Text style={styles.featureEyebrow}>برای شروع</Text>
          <Text style={styles.featureTitle}>از یک حرکت درست شروع کن</Text>
          <Text style={styles.featureDescription}>توضیحات و گروه عضلانی هر تمرین را در کتابخانهٔ فارسی دنبال کن.</Text>
          <View style={styles.featureFooter}>
            <Text style={styles.featureFooterText}>۷ دستهٔ تمرینی</Text>
            <Text style={styles.featureArrow}>←</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>دسته‌های تمرین</Text>
            <Text style={styles.sectionSubtitle}>مسیر تمرینت را بر اساس هدفت انتخاب کن</Text>
          </View>
          <View style={styles.sectionCount}>
            <Text style={styles.sectionCountText}>۰۷</Text>
          </View>
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((category, index) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryCardTop}>
                <View style={[styles.categoryNumber, index === 0 && styles.categoryNumberActive]}>
                  <Text style={[styles.categoryNumberText, index === 0 && styles.categoryNumberTextActive]}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <View style={[styles.categoryIndicator, index === 0 && styles.categoryIndicatorActive]} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDetail}>{category.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>اطلاعات تمرین‌ها روی دستگاه شما نگهداری می‌شود.</Text>
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
    marginBottom: theme.spacing.xxxl,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
  },
  brandMark: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  brandMarkInner: {
    width: 15,
    height: 15,
    borderWidth: 3,
    borderColor: theme.colors.background,
    borderRadius: theme.radius.pill,
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
  onlineDot: {
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
  intro: {
    marginBottom: theme.spacing.xl,
  },
  eyebrow: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  headline: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: 36,
    lineHeight: 52,
    textAlign: "right",
    writingDirection: "rtl",
  },
  description: {
    maxWidth: 330,
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureCard: {
    overflow: "hidden",
    marginBottom: theme.spacing.xxxl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
  },
  featureAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 4,
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  featureEyebrow: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureTitle: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.subtitle.fontSize,
    lineHeight: theme.typography.subtitle.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureDescription: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "right",
    writingDirection: "rtl",
  },
  featureFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  featureFooterText: {
    color: theme.colors.text,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: theme.typography.small.fontSize,
    writingDirection: "rtl",
  },
  featureArrow: {
    color: theme.colors.primary,
    fontSize: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
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
  sectionCount: {
    minWidth: 42,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
  },
  sectionCountText: {
    color: theme.colors.primary,
    fontFamily: "Vazirmatn_700Bold",
    fontSize: theme.typography.caption.fontSize,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "48%",
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
  categoryNumber: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceRaised,
  },
  categoryNumberActive: {
    backgroundColor: theme.colors.primaryMuted,
  },
  categoryNumberText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_500Medium",
    fontSize: 10,
  },
  categoryNumberTextActive: {
    color: theme.colors.primary,
  },
  categoryIndicator: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.border,
  },
  categoryIndicatorActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryTitle: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontFamily: "Vazirmatn_600SemiBold",
    fontSize: theme.typography.small.fontSize,
    textAlign: "right",
    writingDirection: "rtl",
  },
  categoryDetail: {
    marginTop: theme.spacing.xxs,
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "right",
    writingDirection: "rtl",
  },
  footer: {
    marginTop: theme.spacing.lg,
    alignItems: "center",
  },
  footerLine: {
    width: 36,
    height: 3,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  footerText: {
    color: theme.colors.textSubtle,
    fontFamily: "Vazirmatn_400Regular",
    fontSize: theme.typography.caption.fontSize,
    textAlign: "center",
    writingDirection: "rtl",
  },
});
