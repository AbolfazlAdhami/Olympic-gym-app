import { Text, type TextProps } from "react-native";

import { useThemeColor } from "../hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "subtitle" | "link";
};

export function ThemedText({ style, lightColor, darkColor, type = "default", ...otherProps }: ThemedTextProps) {
  const color = useThemeColor(
    {
      light: lightColor,
      dark: darkColor,
    },
    "text",
  );

  const secondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");

  return (
    <Text
      style={[
        {
          color,
        },
        type === "title" && {
          fontSize: 32,
          fontWeight: "700",
        },
        type === "subtitle" && {
          fontSize: 16,
          color: secondaryColor,
        },
        type === "link" && {
          fontSize: 16,
          fontWeight: "600",
          color: primaryColor,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
