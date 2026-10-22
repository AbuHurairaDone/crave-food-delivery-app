import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { SearchBar } from '../../components/SearchBar';
import { CategoryChip } from '../../components/CategoryChip';
import { RestaurantCard } from '../../components/RestaurantCard';
import { FoodCard } from '../../components/FoodCard';
import { EmptyState } from '../../components/EmptyState';
import { CustomBottomSheet } from '../../components/CustomBottomSheet';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TabScreenSpacer } from '../../components/TabScreenSpacer';
import { CATEGORIES } from '../../data/mockData';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setSearchQuery,
  setSelectedCategory,
  setFilters,
  clearFilters,
} from '../../store/slices/restaurantsSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { SortOption } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type ExploreNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ExploreTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated (4.5+)' },
  { id: 'deliveryTime', label: 'Fastest Delivery' },
  { id: 'priceLow', label: 'Price (Low to High)' },
];

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreNavProp>();
  const dispatch = useAppDispatch();

  const { restaurants, foodItems, filters } = useAppSelector((s) => s.restaurants);

  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Filter sheet local state
  const [tempPrice, setTempPrice] = useState<string | null>(filters.priceRange);
  const [tempRating, setTempRating] = useState<number | null>(filters.minRating);
  const [tempDelivery, setTempDelivery] = useState<number | null>(filters.maxDeliveryTime);
  const [tempSort, setTempSort] = useState<SortOption>(filters.sortBy);

  const hasActiveFilters = Boolean(
    filters.priceRange ||
      filters.minRating ||
      filters.maxDeliveryTime ||
      filters.sortBy !== 'popular'
  );

  const handleOpenFilterSheet = () => {
    setTempPrice(filters.priceRange);
    setTempRating(filters.minRating);
    setTempDelivery(filters.maxDeliveryTime);
    setTempSort(filters.sortBy);
    setFilterSheetVisible(true);
  };

  const handleApplyFilters = () => {
    triggerHaptic('success');
    dispatch(
      setFilters({
        priceRange: tempPrice,
        minRating: tempRating,
        maxDeliveryTime: tempDelivery,
        sortBy: tempSort,
      })
    );
    setFilterSheetVisible(false);
  };

  const handleResetFilters = () => {
    triggerHaptic('light');
    setTempPrice(null);
    setTempRating(null);
    setTempDelivery(null);
    setTempSort('popular');
    dispatch(clearFilters());
  };

  // Filtered restaurants logic
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesCuisine = r.cuisines.some((c) => c.toLowerCase().includes(query));
        const matchesArea = r.area.toLowerCase().includes(query);
        if (!matchesName && !matchesCuisine && !matchesArea) return false;
      }

      // Category
      if (filters.selectedCategory !== 'all') {
        const matchesCategory = r.cuisines.some((c) =>
          c.toLowerCase().includes(filters.selectedCategory.toLowerCase())
        );
        if (!matchesCategory) return false;
      }

      // Price
      if (filters.priceRange && r.priceRange !== filters.priceRange) {
        return false;
      }

      // Rating
      if (filters.minRating && r.rating < filters.minRating) {
        return false;
      }

      // Delivery Time (parse e.g. "25-35 min" -> max 35)
      if (filters.maxDeliveryTime) {
        const match = r.deliveryTime.match(/(\d+)/);
        const timeVal = match ? parseInt(match[0], 10) : 30;
        if (timeVal > filters.maxDeliveryTime) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'popular') return b.reviewCount - a.reviewCount;
      if (filters.sortBy === 'deliveryTime') {
        const aTime = parseInt(a.deliveryTime) || 30;
        const bTime = parseInt(b.deliveryTime) || 30;
        return aTime - bTime;
      }
      return 0;
    });
  }, [restaurants, filters]);

  // Filtered food items logic
  const filteredFoodItems = useMemo(() => {
    return foodItems.filter((f) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(query);
        const matchesDesc = f.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      if (filters.selectedCategory !== 'all' && f.category !== filters.selectedCategory) {
        return false;
      }

      if (filters.minRating && f.rating < filters.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'priceLow') return a.price - b.price;
      return b.reviewCount - a.reviewCount;
    });
  }, [foodItems, filters]);

  return (
    <AppScreen scrollable safeTop safeBottom={false} contentContainerStyle={styles.scrollContent}>
      {/* Header & Search */}
      <View style={styles.topSection}>
        <Text style={styles.pageTitle}>Explore & Search</Text>
        <SearchBar
          value={filters.searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          placeholder="Search restaurants, cuisines, dishes..."
          onPressFilter={handleOpenFilterSheet}
          hasActiveFilters={hasActiveFilters}
        />
      </View>

      {/* Category Chips Carousel */}
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
              onSelect={(id) => dispatch(setSelectedCategory(id))}
            />
          ))}
        </ScrollView>
      </View>

      {/* Active filters pill display */}
      {hasActiveFilters && (
        <View style={styles.activeFilterRow}>
          <Text style={styles.activeFilterLabel}>Active filters applied</Text>
          <TouchableOpacity onPress={() => dispatch(clearFilters())}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Toggle between Restaurants & Dishes */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'restaurants' ? styles.toggleBtnActive : null]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveTab('restaurants');
          }}
        >
          <Text
            style={[
              styles.toggleBtnText,
              activeTab === 'restaurants' ? styles.toggleBtnTextActive : null,
            ]}
          >
            Restaurants ({filteredRestaurants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'dishes' ? styles.toggleBtnActive : null]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveTab('dishes');
          }}
        >
          <Text
            style={[
              styles.toggleBtnText,
              activeTab === 'dishes' ? styles.toggleBtnTextActive : null,
            ]}
          >
            Dishes ({filteredFoodItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Content */}
      <View style={styles.resultsContainer}>
        {activeTab === 'restaurants' ? (
          filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() =>
                  navigation.navigate('RestaurantDetails', {
                    restaurantId: restaurant.id,
                  })
                }
              />
            ))
          ) : (
            <EmptyState
              iconName="restaurant-outline"
              title="No Restaurants Found"
              description="We couldn't find any restaurants matching your search or filters. Try adjusting your query."
              actionTitle="Reset Filters"
              onActionPress={() => dispatch(clearFilters())}
            />
          )
        ) : filteredFoodItems.length > 0 ? (
          filteredFoodItems.map((food) => {
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
          })
        ) : (
          <EmptyState
            iconName="fast-food-outline"
            title="No Dishes Found"
            description="We couldn't find any dishes matching your criteria. Try searching for burgers, biryani, or pizza."
            actionTitle="Reset Filters"
            onActionPress={() => dispatch(clearFilters())}
          />
        )}
      </View>

      <TabScreenSpacer />

      {/* Filter Bottom Sheet */}
      <CustomBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        title="Filter & Sort"
        subtitle="Refine places and food to your taste"
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
          {/* Sort By */}
          <Text style={styles.filterGroupTitle}>Sort By</Text>
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.filterOptionPill,
                  tempSort === opt.id ? styles.filterOptionPillActive : null,
                ]}
                onPress={() => setTempSort(opt.id)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    tempSort === opt.id ? styles.filterOptionTextActive : null,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <Text style={styles.filterGroupTitle}>Price Range</Text>
          <View style={styles.optionRow}>
            {(['$', '$$', '$$$'] as const).map((pr) => (
              <TouchableOpacity
                key={pr}
                style={[
                  styles.filterOptionPill,
                  tempPrice === pr ? styles.filterOptionPillActive : null,
                ]}
                onPress={() => setTempPrice(tempPrice === pr ? null : pr)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    tempPrice === pr ? styles.filterOptionTextActive : null,
                  ]}
                >
                  {pr === '$' ? '$ (Budget)' : pr === '$$' ? '$$ (Mid-range)' : '$$$ (Premium)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={styles.filterGroupTitle}>Minimum Rating</Text>
          <View style={styles.optionRow}>
            {[4.0, 4.5, 4.8].map((rat) => (
              <TouchableOpacity
                key={rat}
                style={[
                  styles.filterOptionPill,
                  tempRating === rat ? styles.filterOptionPillActive : null,
                ]}
                onPress={() => setTempRating(tempRating === rat ? null : rat)}
              >
                <Ionicons
                  name="star"
                  size={14}
                  color={tempRating === rat ? '#FFFFFF' : colors.star}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    tempRating === rat ? styles.filterOptionTextActive : null,
                  ]}
                >
                  {rat}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Max Delivery Time */}
          <Text style={styles.filterGroupTitle}>Max Delivery Time</Text>
          <View style={styles.optionRow}>
            {[25, 35, 45].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.filterOptionPill,
                  tempDelivery === mins ? styles.filterOptionPillActive : null,
                ]}
                onPress={() => setTempDelivery(tempDelivery === mins ? null : mins)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    tempDelivery === mins ? styles.filterOptionTextActive : null,
                  ]}
                >
                  Under {mins} mins
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sheetActions}>
            <PrimaryButton
              title="Reset"
              onPress={handleResetFilters}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title="Apply Filters"
              onPress={handleApplyFilters}
              variant="primary"
              size="md"
              gradient
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </CustomBottomSheet>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.xs,
  },
  topSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: typography.sizes.heading,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
  activeFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  activeFilterLabel: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  clearFiltersText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 24,
    padding: 3,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#362415',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  toggleBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  filterGroupTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterOptionPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
});

