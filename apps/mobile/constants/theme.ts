import { Platform } from "react-native";

export const Colors = {
  light: {
    // Base
    background: "#F5F7F6",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",

    // Text
    text: "#111512",
    textSecondary: "#5F6962",
    textMuted: "#8A938D",
    textInverse: "#FFFFFF",

    // Brand
    primary: "#22C55E",
    primaryDark: "#16A34A",
    primaryLight: "#DCFCE7",
    accent: "#A3E635",

    // UI
    border: "#E1E7E3",
    divider: "#E8ECE9",
    icon: "#68736C",

    // Tabs
    tabIconDefault: "#7A857E",
    tabIconSelected: "#22C55E",

    // Semantic
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Training
    energy: "#A3E635",
    intensity: "#F97316",
    recovery: "#38BDF8",
  },

  dark: {
    // Base
    background: "#0B0F0C",
    surface: "#121814",
    surfaceElevated: "#18201A",

    // Text
    text: "#F1F5F2",
    textSecondary: "#A8B2AB",
    textMuted: "#6F7A72",
    textInverse: "#0B0F0C",

    // Brand
    primary: "#39FF6A",
    primaryDark: "#22C55E",
    primaryLight: "#163B22",
    accent: "#B7FF4A",

    // UI
    border: "#263029",
    divider: "#202922",
    icon: "#9AA59D",

    // Tabs
    tabIconDefault: "#6F7A72",
    tabIconSelected: "#39FF6A",

    // Semantic
    success: "#39FF6A",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",

    // Training
    energy: "#B7FF4A",
    intensity: "#FB923C",
    recovery: "#38BDF8",
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
