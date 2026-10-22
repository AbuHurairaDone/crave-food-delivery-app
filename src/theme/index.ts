import { colors } from './colors';
import { typography, spacing, radii, shadows } from './typography';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
};

export type Theme = typeof theme;
export { colors, typography, spacing, radii, shadows };

