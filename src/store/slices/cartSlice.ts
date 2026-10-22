import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, FoodItem, SizeOption, AddOnOption, PromoCode } from '../../types';
import { MOCK_PROMO_CODES } from '../../data/mockData';
import { storage } from '../../utils/storage';

export interface CartConflictInfo {
  pendingItem: {
    foodItem: FoodItem;
    quantity: number;
    selectedSize?: SizeOption;
    selectedAddOns: AddOnOption[];
    specialInstructions?: string;
    restaurantName: string;
  };
  newRestaurantId: string;
  newRestaurantName: string;
  currentRestaurantName: string;
}

export interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  items: CartItem[];
  appliedPromo: PromoCode | null;
  conflictModalVisible: boolean;
  pendingConflict: CartConflictInfo | null;
  isHydrated: boolean;
}

const initialState: CartState = {
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 150,
  items: [],
  appliedPromo: null,
  conflictModalVisible: false,
  pendingConflict: null,
  isHydrated: false,
};

// Helper to generate a unique key for comparing items with custom options
export const generateCartItemKey = (
  foodId: string,
  size?: SizeOption,
  addOns?: AddOnOption[],
  specialInstructions?: string
): string => {
  const sizeKey = size ? size.id : 'default';
  const addOnsKey = (addOns || [])
    .map((a) => a.id)
    .sort()
    .join('-');
  const instructionsKey = (specialInstructions || '').trim().toLowerCase();
  return `${foodId}__size_${sizeKey}__addons_${addOnsKey}__instr_${instructionsKey}`;
};

export const calculateItemPrice = (
  basePrice: number,
  size?: SizeOption,
  addOns?: AddOnOption[]
): number => {
  let price = basePrice;
  if (size) price += size.priceDelta;
  if (addOns && addOns.length > 0) {
    price += addOns.reduce((sum, item) => sum + item.price, 0);
  }
  return price;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<Partial<CartState>>) => {
      if (action.payload.items) {
        state.items = action.payload.items;
      }
      if (action.payload.restaurantId !== undefined) {
        state.restaurantId = action.payload.restaurantId;
      }
      if (action.payload.restaurantName !== undefined) {
        state.restaurantName = action.payload.restaurantName;
      }
      if (action.payload.deliveryFee !== undefined) {
        state.deliveryFee = action.payload.deliveryFee;
      }
      if (action.payload.appliedPromo !== undefined) {
        state.appliedPromo = action.payload.appliedPromo;
      }
      state.isHydrated = true;
    },
    addToCart: (
      state,
      action: PayloadAction<{
        foodItem: FoodItem;
        quantity: number;
        selectedSize?: SizeOption;
        selectedAddOns: AddOnOption[];
        specialInstructions?: string;
        restaurantName: string;
        deliveryFee?: number;
      }>
    ) => {
      const {
        foodItem,
        quantity,
        selectedSize,
        selectedAddOns,
        specialInstructions,
        restaurantName,
        deliveryFee = 150,
      } = action.payload;

      // Check if cart has items from a different restaurant
      if (state.restaurantId && state.restaurantId !== foodItem.restaurantId && state.items.length > 0) {
        state.conflictModalVisible = true;
        state.pendingConflict = {
          pendingItem: {
            foodItem,
            quantity,
            selectedSize,
            selectedAddOns,
            specialInstructions,
            restaurantName,
          },
          newRestaurantId: foodItem.restaurantId,
          newRestaurantName: restaurantName,
          currentRestaurantName: state.restaurantName || 'current restaurant',
        };
        return;
      }

      // Safe to add
      state.restaurantId = foodItem.restaurantId;
      state.restaurantName = restaurantName;
      state.deliveryFee = deliveryFee;

      const itemKey = generateCartItemKey(
        foodItem.id,
        selectedSize,
        selectedAddOns,
        specialInstructions
      );

      const existingIndex = state.items.findIndex((item) => item.cartItemId === itemKey);
      const unitPrice = calculateItemPrice(foodItem.price, selectedSize, selectedAddOns);

      if (existingIndex > -1) {
        const existing = state.items[existingIndex];
        const newQty = existing.quantity + quantity;
        state.items[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
      } else {
        const newItem: CartItem = {
          cartItemId: itemKey,
          foodItem,
          restaurantId: foodItem.restaurantId,
          restaurantName,
          quantity,
          selectedSize,
          selectedAddOns,
          specialInstructions: specialInstructions?.trim() || undefined,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        state.items.push(newItem);
      }

      // Re-evaluate promo code minimum
      if (state.appliedPromo) {
        const subtotal = state.items.reduce((acc, curr) => acc + curr.totalPrice, 0);
        if (subtotal < state.appliedPromo.minOrder) {
          state.appliedPromo = null;
        }
      }

      storage.setItem(storage.KEYS.CART, {
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        appliedPromo: state.appliedPromo,
      });
    },
    resolveConflictReplace: (state) => {
      if (!state.pendingConflict) {
        state.conflictModalVisible = false;
        return;
      }

      const { pendingItem, newRestaurantId, newRestaurantName } = state.pendingConflict;
      state.items = [];
      state.restaurantId = newRestaurantId;
      state.restaurantName = newRestaurantName;
      state.appliedPromo = null;

      const unitPrice = calculateItemPrice(
        pendingItem.foodItem.price,
        pendingItem.selectedSize,
        pendingItem.selectedAddOns
      );

      const itemKey = generateCartItemKey(
        pendingItem.foodItem.id,
        pendingItem.selectedSize,
        pendingItem.selectedAddOns,
        pendingItem.specialInstructions
      );

      const newItem: CartItem = {
        cartItemId: itemKey,
        foodItem: pendingItem.foodItem,
        restaurantId: newRestaurantId,
        restaurantName: newRestaurantName,
        quantity: pendingItem.quantity,
        selectedSize: pendingItem.selectedSize,
        selectedAddOns: pendingItem.selectedAddOns,
        specialInstructions: pendingItem.specialInstructions?.trim() || undefined,
        unitPrice,
        totalPrice: unitPrice * pendingItem.quantity,
      };

      state.items.push(newItem);
      state.conflictModalVisible = false;
      state.pendingConflict = null;

      storage.setItem(storage.KEYS.CART, {
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        appliedPromo: state.appliedPromo,
      });
    },
    dismissConflict: (state) => {
      state.conflictModalVisible = false;
      state.pendingConflict = null;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) => {
      const { cartItemId, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.cartItemId === cartItemId);

      if (index > -1) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          const item = state.items[index];
          item.quantity = quantity;
          item.totalPrice = item.unitPrice * quantity;
        }
      }

      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
        state.appliedPromo = null;
      } else if (state.appliedPromo) {
        const subtotal = state.items.reduce((acc, curr) => acc + curr.totalPrice, 0);
        if (subtotal < state.appliedPromo.minOrder) {
          state.appliedPromo = null;
        }
      }

      storage.setItem(storage.KEYS.CART, {
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        appliedPromo: state.appliedPromo,
      });
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartItemId !== action.payload);
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
        state.appliedPromo = null;
      } else if (state.appliedPromo) {
        const subtotal = state.items.reduce((acc, curr) => acc + curr.totalPrice, 0);
        if (subtotal < state.appliedPromo.minOrder) {
          state.appliedPromo = null;
        }
      }
      storage.setItem(storage.KEYS.CART, {
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        appliedPromo: state.appliedPromo,
      });
    },
    applyPromoCode: (state, action: PayloadAction<string>) => {
      const code = action.payload.trim().toUpperCase();
      const promo = MOCK_PROMO_CODES.find((p) => p.code === code);
      if (!promo) {
        return;
      }

      const subtotal = state.items.reduce((acc, curr) => acc + curr.totalPrice, 0);
      if (subtotal < promo.minOrder) {
        return;
      }

      state.appliedPromo = promo;
      storage.setItem(storage.KEYS.CART, {
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        appliedPromo: state.appliedPromo,
      });
    },
    removePromoCode: (state) => {
      state.appliedPromo = null;
      storage.setItem(storage.KEYS.CART, {
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        appliedPromo: state.appliedPromo,
      });
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
      state.appliedPromo = null;
      storage.removeItem(storage.KEYS.CART);
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  resolveConflictReplace,
  dismissConflict,
  updateQuantity,
  removeFromCart,
  applyPromoCode,
  removePromoCode,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

