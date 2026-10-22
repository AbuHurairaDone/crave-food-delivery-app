import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { triggerHaptic } from '../utils/haptics';

export interface CategoryChipProps {
  id: string;
  name?: string;
  label?: string;
  title?: string;
  icon?: string;
  iconName?: string;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  all: 'apps',
  burgers: 'fast-food',
  burger: 'fast-food',
  pizza: 'pizza',
  desi: 'flame',
  'desi food': 'flame',
  fast_food: 'restaurant',
  'fast food': 'restaurant',
  desserts: 'ice-cream',
  dessert: 'ice-cream',
  drinks: 'cafe',
  beverages: 'cafe',
  beverage: 'cafe',
  asian: 'nutrition',
};

export const CategoryChip: React.FC<CategoryChipProps> = ({
  id,
  name,
  label,
  title,
  icon,
  iconName,
  isSelected = false,
  onSelect,
  style,
}) => {
  const handlePress = () => {
    triggerHaptic('selection');
    onSelect(id);
  };

  // Resilient resolution of display label
  const resolvedLabel =
    name ||
    label ||
    title ||
    (id ? id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ') : 'Category');

  // Resilient resolution of display icon
  const resolvedIcon =
    icon ||
    iconName ||
    CATEGORY_ICON_MAP[id.toLowerCase()] ||
    'restaurant';

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={handlePress}
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}
    >
      <Ionicons
        name={resolvedIcon as any}
        size={16}
        color={isSelected ? '#FFFFFF' : colors.primary}
        style={styles.icon}
      />
      <Text
        style={[styles.text, isSelected ? styles.textSelected : styles.textUnselected]}
        numberOfLines={1}
      >
        {resolvedLabel}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: spacing.xs,
    flexShrink: 0,
    alignSelf: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  icon: {
    marginRight: 7,
  },
  text: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
    fontWeight: '600',
    flexShrink: 0,
    includeFontPadding: false,
  },
  textSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textUnselected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

