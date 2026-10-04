import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function QuantityStepper({ value, min = 0, max, onChange }: { value: number; min?: number; max: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityLabel="Decrease quantity" hitSlop={6} style={styles.btn} disabled={value <= min} onPress={() => onChange(value - 1)}>
        <Text style={[styles.sign, value <= min && styles.off]}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable accessibilityLabel="Increase quantity" hitSlop={6} style={styles.btn} disabled={value >= max} onPress={() => onChange(value + 1)}>
        <Text style={[styles.sign, value >= max && styles.off]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 999, backgroundColor: colors.surface },
  btn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  sign: { fontSize: 20, color: colors.ink },
  off: { opacity: 0.25 },
  value: { minWidth: 24, textAlign: "center", fontWeight: "600", color: colors.ink },
});
