import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme';
import {
  TAB_BAR_PILL_HEIGHT,
  TAB_BAR_MIN_BOTTOM_MARGIN,
} from '../components/CustomTabBar';

/**
 * Calculates the required bottom padding for screens rendered inside the Main Bottom Tab Navigator
 * so their content comfortably clears the floating custom tab bar without clipping.
 *
 * Prevents double-counting:
 * If the parent screen container already applies `insets.bottom` (e.g. `safeBottom={true}` on AppScreen),
 * `insets.bottom` is not added again.
 *
 * @param hasSafeBottomContainer Whether the parent container already applies `insets.bottom`.
 *                               Defaults to false (matching tab screens with `safeBottom={false}`).
 * @param extraBuffer Additional clearance spacing above the floating tab pill (defaults to 16px).
 * @returns Total calculated bottom clearance in pixels.
 */
export const useTabScreenPadding = (
  hasSafeBottomContainer = false,
  extraBuffer: number = spacing.md
): number => {
  const insets = useSafeAreaInsets();

  if (hasSafeBottomContainer) {
    // Parent container already applied `insets.bottom` to its padding.
    // Do NOT add `insets.bottom` again, avoiding double-counted insets.
    // Add only any remaining margin if insets.bottom is smaller than TAB_BAR_MIN_BOTTOM_MARGIN.
    const remainingMargin = Math.max(0, TAB_BAR_MIN_BOTTOM_MARGIN - insets.bottom);
    return TAB_BAR_PILL_HEIGHT + remainingMargin + extraBuffer;
  }

  // Parent container has safeBottom = false; screen reaches the edge of the device display.
  // Account for the floating tab bar's pill height and its bottom offset.
  const bottomOffset = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_MARGIN);
  return TAB_BAR_PILL_HEIGHT + bottomOffset + extraBuffer;
};

