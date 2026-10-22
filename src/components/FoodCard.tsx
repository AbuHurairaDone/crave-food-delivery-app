import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../theme';
import { FoodItem } from '../types';
import { RatingBadge } from './RatingBadge';
import { triggerHaptic } from '../utils/haptics';

interface FoodCardProps {
  foodItem: FoodItem;
  onPress: () => void;
  onQuickAdd?: () => void;
  style?: ViewStyle;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  foodItem,
  onPress,
  onQuickAdd,
  style,
}) => {
  const [imgUri, setImgUri] = useState(foodItem.image);

  const handlePress = () => {
    triggerHaptic('light');
    onPress();
  };

  const handleQuickAdd = () => {
    if (onQuickAdd) {
      triggerHaptic('light');
      onQuickAdd();
    }
  };

  const hasOptions =
    (foodItem.sizeOptions && foodItem.sizeOptions.length > 0) ||
    (foodItem.addOns && foodItem.addOns.length > 0);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={[styles.card, shadows.sm, style]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <View style={styles.tagsRow}>
            {foodItem.isPopular && (
              <View style={styles.popularBadge}>
                <Ionicons name="flame" size={10} color={colors.primaryDeep} />
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            <RatingBadge rating={foodItem.rating} size="sm" />
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {foodItem.name}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {foodItem.description}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>PKR {foodItem.price}</Text>
            {foodItem.originalPrice && (
              <Text style={styles.originalPrice}>PKR {foodItem.originalPrice}</Text>
            )}
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imgUri }}
            onError={() => setImgUri('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80')}
            style={styles.image}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={hasOptions ? handlePress : handleQuickAdd || handlePress}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            {hasOptions && <Text style={styles.customText}>Customize</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
    justifyContent: 'space-between',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  originalPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  imageContainer: {
    width: 105,
    height: 105,
    position: 'relative',
    alignItems: 'center',
  },
  image: {
    width: 105,
    height: 90,
    borderRadius: radii.lg,
    backgroundColor: '#EBE2D8',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    elevation: 3,
    gap: 2,
  },
  customText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

