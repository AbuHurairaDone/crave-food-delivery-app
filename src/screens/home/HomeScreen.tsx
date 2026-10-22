import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { LocationHeader } from '../../components/LocationHeader';
import { SearchBar } from '../../components/SearchBar';
import { CategoryChip } from '../../components/CategoryChip';
import { RestaurantCard } from '../../components/RestaurantCard';
import { FoodCard } from '../../components/FoodCard';
import { CustomModal } from '../../components/CustomModal';
import { TabScreenSpacer } from '../../components/TabScreenSpacer';
import { CATEGORIES } from '../../data/mockData';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSelectedCategory } from '../../store/slices/restaurantsSlice';
import { addToCart, resolveConflictReplace, dismissConflict } from '../../store/slices/cartSlice';
import { triggerHaptic } from '../../utils/haptics';

const { width } = Dimensions.get('window');

// Responsive centered carousel dimensions
const CAROUSEL_CARD_WIDTH = Math.round(width * 0.80);
const CAROUSEL_GAP = 14;
const CAROUSEL_SIDE_INSET = Math.round((width - CAROUSEL_CARD_WIDTH) / 2);
const CAROUSEL_SNAP_INTERVAL = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;

type HomeScreenNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const PROMO_BANNERS = [
  {
    id: 'promo-1',
    title: 'Flat 20% OFF',
    subtitle: 'On your first 3 orders with code CRAVE10',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tag: 'LIMITED DEAL',
  },
  {
    id: 'promo-2',
    title: 'Shinwari Grills',
    subtitle: 'Authentic lamb & mutton karahi from Walled City',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    tag: 'LOCAL GEM',
  },
  {
    id: 'promo-3',
    title: 'Artisan Woodfire Pizza',
    subtitle: '72-hour sourdough crust delivered hot & crisp',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    tag: 'CHEF CHOICE',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavProp>();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const selectedAddress = useAppSelector((s) => s.addresses.selectedAddress);
  const { restaurants, foodItems, filters } = useAppSelector((s) => s.restaurants);
  const { conflictModalVisible, pendingConflict } = useAppSelector((s) => s.cart);

  const [refreshing, setRefreshing] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const handleCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / CAROUSEL_SNAP_INTERVAL);
    if (index >= 0 && index < PROMO_BANNERS.length && index !== activeBannerIndex) {
      setActiveBannerIndex(index);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    triggerHaptic('light');
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const handleCategorySelect = (catId: string) => {
    dispatch(setSelectedCategory(catId));
  };

  const filteredRestaurants =
    filters.selectedCategory === 'all'
      ? restaurants
      : restaurants.filter((r) =>
          r.cuisines.some((c) =>
            c.toLowerCase().includes(filters.selectedCategory.toLowerCase())
          )
        );

  const recommendedDishes = foodItems.filter((f) => f.isRecommended || f.isPopular);
  const specialOffers = foodItems.filter((f) => f.originalPrice && f.originalPrice > f.price);

  const greetingName = user?.name ? user.name.split(' ')[0] : 'Craver';

  return (
    <AppScreen
      scrollable
      safeTop
      safeBottom={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Top Location Bar */}
      <LocationHeader
        address={selectedAddress}
        onPressAddress={() => navigation.navigate('SavedAddresses', { selectMode: true })}
        onPressNotification={() => navigation.navigate('Notifications')}
        hasUnreadNotifications
      />

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingSubtitle}>GOOD DAY, {greetingName.toUpperCase()} 👋</Text>
        <Text style={styles.greetingTitle}>What are you craving today?</Text>
      </View>

      {/* Search Bar - Tapping navigates to Explore */}
      <View style={styles.searchSection}>
        <SearchBar
          value=""
          onChangeText={() => {}}
          editable={false}
          onPress={() => navigation.navigate('ExploreTab')}
          placeholder="Search burgers, biryani, sourdough pizza..."
        />
      </View>

      {/* Promotional Banner Carousel */}
      <View style={styles.carouselSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CAROUSEL_SNAP_INTERVAL}
          decelerationRate="fast"
          snapToAlignment="start"
          contentContainerStyle={[styles.carouselContainer, { paddingHorizontal: CAROUSEL_SIDE_INSET }]}
          onScroll={handleCarouselScroll}
          scrollEventThrottle={16}
        >
          {PROMO_BANNERS.map((banner, index) => {
            const isLast = index === PROMO_BANNERS.length - 1;
            return (
              <TouchableOpacity
                key={banner.id}
                style={[
                  styles.bannerCard,
                  shadows.md,
                  { width: CAROUSEL_CARD_WIDTH },
                  !isLast ? { marginRight: CAROUSEL_GAP } : null,
                ]}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('ExploreTab')}
              >
                <Image source={{ uri: banner.image }} style={styles.bannerImage} resizeMode="cover" />
                <View style={styles.bannerOverlay}>
                  <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>{banner.tag}</Text>
                  </View>
                  <Text style={styles.bannerTitle} numberOfLines={1}>
                    {banner.title}
                  </Text>
                  <Text style={styles.bannerSubtitle} numberOfLines={2}>
                    {banner.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Carousel Pagination Indicators */}
        <View style={styles.carouselPagination}>
          {PROMO_BANNERS.map((banner, index) => (
            <View
              key={`dot-${banner.id}`}
              style={[
                styles.paginationDot,
                activeBannerIndex === index ? styles.paginationDotActive : null,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} numberOfLines={1}>Categories</Text>
      </View>
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              id={cat.id}
              name={cat.name}
              icon={cat.icon}
              isSelected={filters.selectedCategory === cat.id}
              onSelect={handleCategorySelect}
            />
          ))}
        </ScrollView>
      </View>

      {/* Recommended Dishes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Signature Dishes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ExploreTab')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalDishesContainer}
      >
        {recommendedDishes.slice(0, 5).map((dish) => {
          const rest = restaurants.find((r) => r.id === dish.restaurantId);
          return (
            <TouchableOpacity
              key={dish.id}
              style={[styles.dishCard, shadows.sm]}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('FoodDetails', {
                  foodItemId: dish.id,
                  restaurantId: dish.restaurantId,
                })
              }
            >
              <Image source={{ uri: dish.image }} style={styles.dishImage} resizeMode="cover" />
              <View style={styles.dishInfo}>
                <Text style={styles.dishName} numberOfLines={1}>
                  {dish.name}
                </Text>
                <Text style={styles.dishRest} numberOfLines={1}>
                  {rest?.name || 'Top Kitchen'}
                </Text>
                <View style={styles.dishPriceRow}>
                  <Text style={styles.dishPrice}>PKR {dish.price}</Text>
                  <TouchableOpacity
                    style={styles.dishAddBtn}
                    onPress={() =>
                      navigation.navigate('FoodDetails', {
                        foodItemId: dish.id,
                        restaurantId: dish.restaurantId,
                      })
                    }
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Popular Restaurants */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filters.selectedCategory === 'all'
            ? 'Popular in Lahore'
            : `${CATEGORIES.find((c) => c.id === filters.selectedCategory)?.name || 'Filtered'} Restaurants`}
        </Text>
        <Text style={styles.countBadge}>{filteredRestaurants.length} places</Text>
      </View>

      <View style={styles.restaurantsList}>
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onPress={() =>
              navigation.navigate('RestaurantDetails', {
                restaurantId: restaurant.id,
              })
            }
          />
        ))}
      </View>

      {/* Special Offers Section */}
      {specialOffers.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.specialHeaderRow}>
              <Ionicons name="pricetag" size={18} color={colors.primaryDeep} />
              <Text style={styles.sectionTitle}>Special Offers & Deals</Text>
            </View>
          </View>
          <View style={styles.specialList}>
            {specialOffers.slice(0, 4).map((food) => {
              const rest = restaurants.find((r) => r.id === food.restaurantId);
              return (
                <FoodCard
                  key={food.id}
                  foodItem={food}
                  onPress={() =>
                    navigation.navigate('FoodDetails', {
                      foodItemId: food.id,
                      restaurantId: food.restaurantId,
                    })
                  }
                  onQuickAdd={() =>
                    dispatch(
                      addToCart({
                        foodItem: food,
                        quantity: 1,
                        selectedAddOns: [],
                        restaurantName: rest?.name || 'Restaurant',
                        deliveryFee: rest?.deliveryFee || 150,
                      })
                    )
                  }
                />
              );
            })}
          </View>
        </>
      )}

      {/* Bottom padding for custom tab bar */}
      <TabScreenSpacer />

      {/* Single Restaurant Cart Conflict Modal */}
      <CustomModal
        visible={conflictModalVisible}
        onClose={() => dispatch(dismissConflict())}
        iconName="alert-circle"
        iconColor={colors.warning}
        iconBgColor={colors.warningSoft}
        title="Start New Order?"
        description={`Your cart currently contains items from "${pendingConflict?.currentRestaurantName}". Would you like to clear the cart and add items from "${pendingConflict?.newRestaurantName}"?`}
        primaryButtonTitle="Clear Cart & Add"
        onPrimaryPress={() => {
          triggerHaptic('success');
          dispatch(resolveConflictReplace());
        }}
        secondaryButtonTitle="Keep Current Cart"
        onSecondaryPress={() => {
          triggerHaptic('light');
          dispatch(dismissConflict());
        }}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.xs,
  },
  greetingSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  greetingSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 1,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: typography.sizes.heading,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  carouselSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  carouselContainer: {
    alignItems: 'center',
  },
  carouselPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 2,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    width: 18,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  bannerCard: {
    width: CAROUSEL_CARD_WIDTH,
    height: 165,
    borderRadius: radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#332314',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(25, 17, 10, 0.45)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  bannerTag: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
    marginBottom: 6,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.xs,
    color: '#F4ECE4',
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  countBadge: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  specialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categorySection: {
    height: 50,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  horizontalDishesContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dishCard: {
    width: 155,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dishImage: {
    width: '100%',
    height: 105,
    backgroundColor: '#EBE2D8',
  },
  dishInfo: {
    padding: spacing.sm,
  },
  dishName: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dishRest: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dishPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  dishAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantsList: {
    paddingHorizontal: spacing.md,
  },
  specialList: {
    paddingHorizontal: spacing.md,
  },
});

