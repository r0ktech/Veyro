import { Image } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { imageUrl } from "@/lib/config";
import { colors } from "@/lib/theme";
import type { Product } from "@/lib/types";

/**
 * Product photo, served by the website. Photos come in every shape (tall phones,
 * wide keyboards), so the whole photo is fitted and centred inside a fixed-ratio
 * frame. The frame's size never depends on the photo, so grids stay aligned.
 */
export function ProductImage({
  product,
  aspectRatio = 4 / 3,
  style,
}: {
  product: Product;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const uri = imageUrl(product.image_url);
  return (
    <View style={[styles.frame, { aspectRatio }, style]}>
      {uri && (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          contentPosition="center"
          transition={150}
          recyclingKey={product.id}
          accessibilityLabel={product.name}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: "100%", overflow: "hidden", backgroundColor: colors.tint, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%" },
});
