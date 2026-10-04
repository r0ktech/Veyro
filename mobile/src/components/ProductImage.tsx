import { Image } from "expo-image";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { imageUrl } from "@/lib/config";
import { colors } from "@/lib/theme";
import type { Product } from "@/lib/types";

/** Product photo, served by the website, shown whole on a soft tinted backdrop. */
export function ProductImage({ product, style }: { product: Product; style?: ViewStyle }) {
  const uri = imageUrl(product.image_url);
  return (
    <View style={[styles.frame, { backgroundColor: product.accent + "22" }, style]}>
      {uri && (
        <>
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={30} transition={150} />
          <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" transition={150} accessibilityLabel={product.name} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { aspectRatio: 4 / 3, overflow: "hidden", backgroundColor: colors.tint },
});
