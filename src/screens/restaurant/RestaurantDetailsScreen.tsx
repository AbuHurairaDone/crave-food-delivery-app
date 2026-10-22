import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { IconButton } from '../../components/IconButton';
import { FavoriteButton } from '../../components/FavoriteButton';
import { RatingBadge } from '../../components/RatingBadge';
import { FoodCard } from '../../components/FoodCard';
import { CustomModal } from '../../components/CustomModal';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleFavoriteRestaurant } from '../../store/slices/restaurantsSlice';
import { addToCart, resolveConflictReplace, dismissConflict } from '../../store/slices/cartSlice';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

type RestaurantDetailsRouteProp = RouteProp<RootStackParamList, 'RestaurantDetails'>;

export const RestaurantDetailsScreen: React.FC<{ route: RestaurantDetailsRouteProp }> = ({
  route,
}) => {
  const { restaurantId } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const allRestaurants = useAppSelector((s) => s.restaurants.restaurants);
  const restaurant = useMemo(
    () => allRestaurants.find((r) => r.id === restaurantId),
    [allRestaurants, restaurantId]
  );
  const allFoodItems = useAppSelector((s) => s.restaurants.foodItems);
  const foodItems = useMemo(
    () => allFoodItems.filter((f) => f.restaurantId === restaurantId),
    [allFoodItems, restaurantId]
  );
  const favoriteRestaurantIds = useAppSelector(
    (s) => s.restaurants.favoriteRestaurantIds
  );
  const isFavorite = favoriteRestaurantIds.includes(restaurantId);

  const cartState = useAppSelector((s) => s.cart);
  const isThisRestaurantInCart = cartState.restaurantId === restaurantId && cartState.items.length > 0;
  const totalCartCount = cartState.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartSubtotal = cartState.items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Group dishes by category
  const categories = Array.from(new Set(foodItems.map((f) => f.category)));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [heroUri, setHeroUri] = useState(restaurant?.heroImage);

  if (!restaurant) {
    return (
      <AppScreen safeTop safeBottom>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Restaurant not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  const displayedFoodItems =
    selectedCategory === 'all'
      ? foodItems
      : foodItems.filter((f) => f.category === selectedCategory);

  const bottomClearance = isThisRestaurantInCart
    ? 52 + Math.max(insets.bottom, 16) + 24
    : Math.max(insets.bottom, 24);

  return (
    <AppScreen safeTop={false} safeBottom={false} scrollable contentContainerStyle={styles.scrollContent}>
      {/* Hero Image Header */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: heroUri }}
          onError={() => setHeroUri('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Floating Top Controls */}
        <View style={[styles.topControls, { top: Math.max(insets.top, 16) + 4 }]}>
          <IconButton
            icon={<Ionicons name="arrow-back" size={20} color={colors.textPrimary} />}
            onPress={() => navigation.goBack()}
            size={42}
            variant="surface"
          />
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => dispatch(toggleFavoriteRestaurant(restaurant.id))}
            size={42}
          />
        </View>
      </View>

      {/* Restaurant Info Card */}
      <View style={[styles.infoCard, shadows.sm]}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
        </View>

        <Text style={styles.cuisines}>{restaurant.cuisines.join(' • ')}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBadge}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
          </View>

          <View style={styles.metaBadge}>
            <Ionicons name="bicycle-outline" size={14} color={colors.primary} />
            <Text style={styles.metaText}>
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `PKR ${restaurant.deliveryFee}`}
            </Text>
          </View>

          <View style={styles.metaBadge}>
            <Ionicons name="cash-outline" size={14} color={colors.primary} />
            <Text style={styles.metaText}>Min PKR {restaurant.minOrder}</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {restaurant.address}, {restaurant.area}
          </Text>
        </View>

        {restaurant.promoBadge && (
          <View style={styles.offerBanner}>
            <Ionicons name="gift-outline" size={16} color={colors.primaryDeep} />
            <Text style={styles.offerText}>Deal: {restaurant.promoBadge}</Text>
          </View>
        )}
      </View>

      {/* Menu Categories Horizontal Selector */}
      <View style={styles.menuHeader}>
        <Text style={styles.menuHeading}>Menu</Text>
        <Text style={styles.dishesCount}>{foodItems.length} dishes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryPillsContainer}
      >
        <TouchableOpacity
          style={[
            styles.menuPill,
            selectedCategory === 'all' ? styles.menuPillActive : null,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.menuPillText,
              selectedCategory === 'all' ? styles.menuPillTextActive : null,
            ]}
          >
            All Items
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.menuPill,
              selectedCategory === cat ? styles.menuPillActive : null,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.menuPillText,
                selectedCategory === cat ? styles.menuPillTextActive : null,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food Items List */}
      <View style={styles.foodList}>
        {displayedFoodItems.map((food) => (
          <FoodCard
            key={food.id}
            foodItem={food}
            onPress={() =>
              navigation.navigate('FoodDetails', {
                foodItemId: food.id,
                restaurantId: restaurant.id,
              })
            }
            onQuickAdd={() =>
              dispatch(
                addToCart({
                  foodItem: food,
                  quantity: 1,
                  selectedAddOns: [],
                  restaurantName: restaurant.name,
                  deliveryFee: restaurant.deliveryFee,
                })
              )
            }
          />
        ))}
      </View>

      {/* Extra bottom clearance dynamically calculated to clear the floating view-cart button */}
      <View style={{ height: bottomClearance }} />

      {/* Floating View Cart Summary Button */}
      {isThisRestaurantInCart && (
        <View style={[styles.floatingCartContainer, { bottom: Math.max(insets.bottom, 16) + 10 }]}>
          <TouchableOpacity
            style={[styles.floatingCartBtn, shadows.lg]}
            activeOpacity={0.9}
            onPress={() => {
              triggerHaptic('light');
              navigation.navigate('MainTabs', { screen: 'CartTab' });
            }}
          >
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{totalCartCount}</Text>
            </View>
            <Text style={styles.floatingCartTitle}>View Cart</Text>
            <Text style={styles.floatingCartPrice}>PKR {totalCartSubtotal}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Conflict Modal */}
      <CustomModal
        visible={cartState.conflictModalVisible}
        onClose={() => dispatch(dismissConflict())}
        iconName="alert-circle"
        iconColor={colors.warning}
        iconBgColor={colors.warningSoft}
        title="Start New Order?"
        description={`Your cart already has items from "${cartState.pendingConflict?.currentRestaurantName}". Would you like to clear it and order from "${restaurant.name}"?`}
        primaryButtonTitle="Clear Cart & Add"
        onPrimaryPress={() => dispatch(resolveConflictReplace())}
        secondaryButtonTitle="Keep Current Cart"
        onSecondaryPress={() => dispatch(dismissConflict())}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    width,
    height: 240,
    position: 'relative',
    backgroundColor: '#EBE2D8',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -24,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cuisines: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  addressText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  offerText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  menuHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dishesCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryPillsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 8,
  },
  menuPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  menuPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  menuPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  foodList: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  floatingCartContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  floatingCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.full,
    width: '100%',
  },
  cartCountCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: typography.sizes.sm,
  },
  floatingCartTitle: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  floatingCartPrice: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '800',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  backLink: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '700',
  },
});

