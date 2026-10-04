import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { Button } from "@/components/Button";
import { OrderSummary } from "@/components/OrderSummary";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { API_URL } from "@/lib/config";
import { PAYMENT_METHODS } from "@/lib/pricing";
import { colors } from "@/lib/theme";

type Values = Record<
  "full_name" | "phone" | "address_line1" | "address_line2" | "city" | "state" | "postal_code" | "country" | "payment_method" | "notes",
  string
>;

export default function CheckoutScreen() {
  const { session } = useAuth();
  const { lines, subtotalCents, reload } = useCart();
  const meta = session?.user.user_metadata ?? {};
  const [values, setValues] = useState<Values>({
    full_name: (meta.full_name ?? meta.name ?? "") as string,
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
    payment_method: "pay_on_delivery",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Values) => (text: string) => setValues((v) => ({ ...v, [key]: text }));

  // Same endpoint logic as the website's checkout: POST /api/checkout on the Veyro site.
  async function placeOrder() {
    if (!session) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFieldErrors(body.fieldErrors ?? {});
        setError(body.error ?? `Checkout failed (${res.status}).`);
        return;
      }
      await reload(); // the server emptied the cart
      router.dismissAll();
      router.push({ pathname: "/order/[id]", params: { id: body.orderId, placed: "1", emailed: body.emailSent ? "1" : "0" } });
    } catch {
      setError(`Couldn't reach the Veyro website at ${API_URL || "(EXPO_PUBLIC_API_URL not set)"}.`);
    } finally {
      setSubmitting(false);
    }
  }

  const field = (key: keyof Values, label: string, props: TextInputProps = {}) => (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={values[key]}
        onChangeText={set(key)}
        style={[styles.input, fieldErrors[key] && { borderColor: colors.danger }]}
        placeholderTextColor={colors.muted}
        {...props}
      />
      {fieldErrors[key] && <Text style={styles.fieldError}>{fieldErrors[key]}</Text>}
    </View>
  );

  if (!lines.length) {
    return <Text style={styles.emptyText}>Your cart is empty.</Text>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.signedIn}>Signed in as {session?.user.email}. Your confirmation email goes here.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping details</Text>
          {field("full_name", "Full name", { autoComplete: "name", textContentType: "name" })}
          {field("phone", "Phone", { keyboardType: "phone-pad", autoComplete: "tel", textContentType: "telephoneNumber" })}
          {field("address_line1", "Address", { autoComplete: "street-address" })}
          {field("address_line2", "Apartment, suite, etc. (optional)")}
          {field("city", "City", { textContentType: "addressCity" })}
          {field("state", "State", { textContentType: "addressState" })}
          {field("postal_code", "Postal code", { keyboardType: "number-pad", textContentType: "postalCode" })}
          {field("country", "Country", { textContentType: "countryName" })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          {Object.entries(PAYMENT_METHODS).map(([key, label]) => {
            const active = values.payment_method === key;
            return (
              <Pressable key={key} onPress={() => set("payment_method")(key)} style={[styles.option, active && styles.optionActive]}>
                <View style={[styles.radio, active && styles.radioActive]} />
                <Text style={styles.optionText}>{label}</Text>
              </Pressable>
            );
          })}
          {field("notes", "Order notes (optional)", { multiline: true, style: [styles.input, { minHeight: 80, textAlignVertical: "top" }] })}
        </View>

        <OrderSummary subtotalCents={subtotalCents} />
        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Place order" variant="brand" loading={submitting} onPress={placeOrder} />
        <Text style={styles.note}>Prices, stock and totals are confirmed on our server when you place the order.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 48 },
  signedIn: { fontSize: 13, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  label: { fontSize: 13, fontWeight: "500", color: colors.inkSoft },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: colors.ink, backgroundColor: colors.surface },
  fieldError: { fontSize: 12, color: colors.danger },
  option: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14 },
  optionActive: { borderColor: colors.brand, backgroundColor: colors.brand + "0D" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.line },
  radioActive: { borderColor: colors.brand, borderWidth: 6 },
  optionText: { fontSize: 14, fontWeight: "500", color: colors.ink, flex: 1 },
  error: { color: colors.danger, backgroundColor: colors.danger + "0D", padding: 12, borderRadius: 12, overflow: "hidden" },
  note: { fontSize: 12, color: colors.muted, textAlign: "center" },
  emptyText: { textAlign: "center", marginTop: 60, color: colors.muted },
});
