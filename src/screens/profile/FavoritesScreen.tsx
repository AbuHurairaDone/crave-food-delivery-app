import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { RestaurantCard } from '../../components/RestaurantCard';
import { FoodCard } from '../../components/FoodCard';
import { EmptyState } from '../../components/EmptyState';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { triggerHaptic } from '../../utils/haptics';

type FavoritesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Favorites'>;
};

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { restaurants, foodItems, favoriteRestaurantIds, favoriteFoodIds } =
    useAppSelector((s) => s.restaurants);

  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');

  const favoritedRestaurants = restaurants.filter((r) =>
    favoriteRestaurantIds.includes(r.id)
  );
  const favoritedDishes = foodItems.filter((f) =>
    favoriteFoodIds.includes(f.id)
  );

  return (
    <AppScreen safeTop safeBottom scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="My Favorites" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'restaurants' ? styles.tabBtnActive : null]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveTab('restaurants');
          }}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'restaurants' ? styles.tabBtnTextActive : null,
            ]}
          >
            Restaurants ({favoritedRestaurants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'dishes' ? styles.tabBtnActive : null]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveTab('dishes');
          }}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'dishes' ? styles.tabBtnTextActive : null,
            ]}
          >
            Dishes ({favoritedDishes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {activeTab === 'restaurants' ? (
          favoritedRestaurants.length > 0 ? (
            favoritedRestaurants.map((restaurant) => (
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
              iconName="heart-outline"
              title="No Favorite Restaurants"
              description="Tap the heart icon on any restaurant card to add it to your favorites."
              actionTitle="Browse Restaurants"
              onActionPress={() => navigation.navigate('MainTabs')}
            />
          )
        ) : favoritedDishes.length > 0 ? (
          favoritedDishes.map((food) => {
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
            title="No Favorite Dishes"
            description="Tap the heart icon when viewing a food item to save your top cravings here."
            actionTitle="Discover Food"
            onActionPress={() => navigation.navigate('MainTabs')}
          />
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 24,
    padding: 3,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#362415',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
});

