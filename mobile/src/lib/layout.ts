import { useWindowDimensions } from "react-native";

export const SCREEN_PADDING = 16;
export const GRID_GAP = 12;
/** Content never gets wider than this on tablets, so lines and forms stay readable. */
export const MAX_CONTENT_WIDTH = 720;

/**
 * Product grid sized from the actual screen width: 2 columns on phones,
 * 3 on large phones in landscape / small tablets, 4 on tablets. Cards get an
 * exact pixel width so every photo in a row lines up, including a lone last card.
 */
export function useProductGrid() {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const cardWidth = Math.floor((width - SCREEN_PADDING * 2 - GRID_GAP * (columns - 1)) / columns);
  return { columns, cardWidth };
}

/** Width available for page content, capped on tablets. */
export function useContentWidth() {
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  return { width, height, contentWidth, isCompact: width < 360 };
}
