export const theme = {
  colors: {
    background: "#101310",
    surface: "#171C18",
    surfaceRaised: "#202720",
    border: "#2B342C",
    primary: "#B6FF52",
    primaryPressed: "#98E63A",
    primaryMuted: "#344725",
    secondary: "#75E3A0",
    text: "#F4F7F1",
    textMuted: "#A8B1A5",
    textSubtle: "#778276",
    danger: "#FF6B6B",
    warning: "#FFD166",
    overlay: "rgba(0, 0, 0, 0.64)",
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    huge: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 999,
  },
  typography: {
    caption: {
      fontSize: 12,
      lineHeight: 18,
    },
    small: {
      fontSize: 14,
      lineHeight: 22,
    },
    body: {
      fontSize: 16,
      lineHeight: 26,
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 28,
    },
    title: {
      fontSize: 24,
      lineHeight: 34,
    },
    display: {
      fontSize: 32,
      lineHeight: 42,
    },
  },
} as const;
