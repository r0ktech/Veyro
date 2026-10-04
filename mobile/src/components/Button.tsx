import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

type Variant = "primary" | "brand" | "ghost";

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...props
}: PressableProps & { title: string; variant?: Variant; loading?: boolean; style?: ViewStyle }) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, isDisabled && styles.disabled, style]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.ink : "#fff"} />
      ) : (
        <Text style={[styles.text, variant === "ghost" && { color: colors.ink }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: 999, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.ink },
  brand: { backgroundColor: colors.brand },
  ghost: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.45 },
  text: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
