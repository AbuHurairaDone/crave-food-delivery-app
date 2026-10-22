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
import { Restaurant } from '../types';
import { RatingBadge } from './RatingBadge';
import { FavoriteButton } from './FavoriteButton';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleFavoriteRestaurant } from '../store/slices/restaurantsSlice';
import { triggerHaptic } from '../utils/haptics';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  style?: ViewStyle;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  style,
}) => {
  const dispatch = useAppDispatch();
  const favoriteRestaurantIds = useAppSelector(
    (s) => s.restaurants.favoriteRestaurantIds
  );
  const isFavorite = favoriteRestaurantIds.includes(restaurant.id);
  const [imgUri, setImgUri] = useState(restaurant.heroImage);

  const handlePress = () => {
    triggerHaptic('light');
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.card, shadows.md, style]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imgUri }}
          onError={() => setImgUri('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')}
          style={styles.image}
          resizeMode="cover"
        />

        {restaurant.promoBadge && (
          <View style={styles.promoBadge}>
            <Text style={styles.promoText}>{restaurant.promoBadge}</Text>
          </View>
        )}

        <View style={styles.favoriteWrapper}>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => dispatch(toggleFavoriteRestaurant(restaurant.id))}
            size={36}
          />
        </View>

        <View style={styles.deliveryBadge}>
          <Ionicons name="time-outline" size={13} color="#FFFFFF" />
          <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
        </View>

        <Text style={styles.cuisines} numberOfLines={1}>
          {restaurant.cuisines.join(' • ')}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `PKR ${restaurant.deliveryFee}`}
            </Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {restaurant.area}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    height: 175,
    width: '100%',
    position: 'relative',
    backgroundColor: '#EBE2D8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    elevation: 3,
  },
  promoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favoriteWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(36, 34, 31, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  deliveryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoContainer: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  cuisines: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dot: {
    marginHorizontal: 8,
    color: colors.textMuted,
  },
});

