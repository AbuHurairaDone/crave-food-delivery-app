import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../../types';
import { storage } from '../../utils/storage';

export interface OrdersState {
  activeOrders: Order[];
  pastOrders: Order[];
  isHydrated: boolean;
}

const ORDER_STATUS_FLOW: OrderStatus[] = [
  'confirmed',
  'preparing',
  'picked_up',
  'on_the_way',
  'delivered',
];

const INITIAL_MOCK_PAST_ORDERS: Order[] = [
  {
    id: 'ord-past-101',
    orderNumber: 'CRV-89421',
    restaurantId: 'rest-1',
    restaurantName: 'The Burger Cartel',
    restaurantImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    items: [
      {
        cartItemId: 'item-101-sample',
        foodItem: {
          id: 'food-101',
          restaurantId: 'rest-1',
          name: 'Truffle Smash Double',
          description: 'Two smashed beef patties with truffle aioli',
          price: 1150,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          category: 'burgers',
          rating: 4.9,
          reviewCount: 142,
        },
        restaurantId: 'rest-1',
        restaurantName: 'The Burger Cartel',
        quantity: 2,
        selectedAddOns: [],
        unitPrice: 1150,
        totalPrice: 2300,
      },
    ],
    subtotal: 2300,
    deliveryFee: 150,
    discount: 230,
    total: 2220,
    promoCode: 'CRAVE10',
    deliveryAddress: {
      id: 'addr-1',
      label: 'Home',
      title: 'Home (Gulberg III)',
      street: 'House 42-B, Street 7, Block B-3',
      area: 'Gulberg III',
      city: 'Lahore',
    },
    status: 'delivered',
    paymentMethod: 'cod',
    estimatedDeliveryTime: 'Delivered',
    createdAt: 'Yesterday, 8:45 PM',
    rider: {
      name: 'Usman Tariq',
      phone: '+92 321 8899123',
      rating: 4.9,
      vehicle: 'Honda CD 70 (LER-4912)',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  },
];

const initialState: OrdersState = {
  activeOrders: [],
  pastOrders: INITIAL_MOCK_PAST_ORDERS,
  isHydrated: false,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    hydrateOrders: (
      state,
      action: PayloadAction<{ activeOrders?: Order[]; pastOrders?: Order[] }>
    ) => {
      if (action.payload.activeOrders) {
        state.activeOrders = action.payload.activeOrders;
      }
      if (action.payload.pastOrders && action.payload.pastOrders.length > 0) {
        state.pastOrders = action.payload.pastOrders;
      }
      state.isHydrated = true;
    },
    createOrder: (state, action: PayloadAction<Order>) => {
      state.activeOrders.unshift(action.payload);
      storage.setItem(storage.KEYS.ORDERS, {
        activeOrders: state.activeOrders,
        pastOrders: state.pastOrders,
      });
    },
    advanceOrderStatus: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const activeIdx = state.activeOrders.findIndex((o) => o.id === orderId);

      if (activeIdx > -1) {
        const order = state.activeOrders[activeIdx];
        const currentStatusIdx = ORDER_STATUS_FLOW.indexOf(order.status);

        if (currentStatusIdx < ORDER_STATUS_FLOW.length - 1) {
          const nextStatus = ORDER_STATUS_FLOW[currentStatusIdx + 1];
          order.status = nextStatus;

          if (nextStatus === 'delivered') {
            // Move to past orders
            state.activeOrders.splice(activeIdx, 1);
            state.pastOrders.unshift(order);
          }
        }
      }

      storage.setItem(storage.KEYS.ORDERS, {
        activeOrders: state.activeOrders,
        pastOrders: state.pastOrders,
      });
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      const activeIdx = state.activeOrders.findIndex((o) => o.id === orderId);

      if (activeIdx > -1) {
        const order = state.activeOrders[activeIdx];
        order.status = 'cancelled';
        state.activeOrders.splice(activeIdx, 1);
        state.pastOrders.unshift(order);
      }

      storage.setItem(storage.KEYS.ORDERS, {
        activeOrders: state.activeOrders,
        pastOrders: state.pastOrders,
      });
    },
  },
});

export const { hydrateOrders, createOrder, advanceOrderStatus, cancelOrder } =
  ordersSlice.actions;

export default ordersSlice.reducer;

