import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Restaurant, FoodItem, SortOption } from '../../types';
import { MOCK_RESTAURANTS, MOCK_FOOD_ITEMS } from '../../data/mockData';
import { storage } from '../../utils/storage';

export interface FilterState {
  searchQuery: string;
  selectedCategory: string; // 'all' or category id
  priceRange: string | null; // '$' | '$$' | '$$$'
  minRating: number | null; // e.g. 4.5
  maxDeliveryTime: number | null; // e.g. 30
  sortBy: SortOption;
}

export interface RestaurantsState {
  restaurants: Restaurant[];
  foodItems: FoodItem[];
  favoriteRestaurantIds: string[];
  favoriteFoodIds: string[];
  filters: FilterState;
  isHydrated: boolean;
}

const initialFilters: FilterState = {
  searchQuery: '',
  selectedCategory: 'all',
  priceRange: null,
  minRating: null,
  maxDeliveryTime: null,
  sortBy: 'popular',
};

const initialState: RestaurantsState = {
  restaurants: MOCK_RESTAURANTS,
  foodItems: MOCK_FOOD_ITEMS,
  favoriteRestaurantIds: ['rest-1', 'rest-3'],
  favoriteFoodIds: ['food-101', 'food-301'],
  filters: initialFilters,
  isHydrated: false,
};

export const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    hydrateFavorites: (
      state,
      action: PayloadAction<{
        restaurantIds?: string[];
        foodIds?: string[];
      }>
    ) => {
      if (action.payload.restaurantIds) {
        state.favoriteRestaurantIds = action.payload.restaurantIds;
      }
      if (action.payload.foodIds) {
        state.favoriteFoodIds = action.payload.foodIds;
      }
      state.isHydrated = true;
    },
    toggleFavoriteRestaurant: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteRestaurantIds.includes(id)) {
        state.favoriteRestaurantIds = state.favoriteRestaurantIds.filter((item) => item !== id);
      } else {
        state.favoriteRestaurantIds.push(id);
      }
      storage.setItem(storage.KEYS.FAVORITE_RESTAURANTS, state.favoriteRestaurantIds);
    },
    toggleFavoriteFood: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favoriteFoodIds.includes(id)) {
        state.favoriteFoodIds = state.favoriteFoodIds.filter((item) => item !== id);
      } else {
        state.favoriteFoodIds.push(id);
      }
      storage.setItem(storage.KEYS.FAVORITE_FOODS, state.favoriteFoodIds);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.filters.selectedCategory = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        ...initialFilters,
        searchQuery: state.filters.searchQuery,
      };
    },
    resetSearch: (state) => {
      state.filters.searchQuery = '';
    },
  },
});

export const {
  hydrateFavorites,
  toggleFavoriteRestaurant,
  toggleFavoriteFood,
  setSearchQuery,
  setSelectedCategory,
  setFilters,
  clearFilters,
  resetSearch,
} = restaurantsSlice.actions;

export default restaurantsSlice.reducer;

