import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCart } from "@/lib/cart";
import { colors } from "@/lib/theme";

export default function TabLayout() {
  const { count } = useCart();
  return (
    <NativeTabs backgroundColor={colors.surface} tintColor={colors.brand}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bag" md="storefront" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cart" md="shopping_cart" />
        {count > 0 && <NativeTabs.Trigger.Badge>{String(count)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
