import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii } from '../theme';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  size = 'md',
  style,
}) => {
  const isSmall = size === 'sm';

  return (
    <View style={[styles.container, isSmall ? styles.smContainer : null, style]}>
      <Ionicons name="star" size={isSmall ? 11 : 13} color={colors.star} />
      <Text style={[styles.ratingText, isSmall ? styles.smRatingText : null]}>
        {rating.toFixed(1)}
      </Text>
      {reviewCount !== undefined && (
        <Text style={[styles.reviewCountText, isSmall ? styles.smReviewText : null]}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    gap: 4,
  },
  smContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: '#8A5C00',
  },
  smRatingText: {
    fontSize: typography.sizes.xs,
  },
  reviewCountText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  smReviewText: {
    fontSize: 10,
  },
});

