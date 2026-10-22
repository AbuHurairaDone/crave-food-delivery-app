export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export type AddressType = 'Home' | 'Work' | 'Other';

export interface Address {
  id: string;
  label: AddressType;
  title: string;
  street: string;
  area: string;
  city: string;
  note?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface SizeOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  calories?: number;
  preparationTime?: string;
  sizeOptions?: SizeOption[];
  addOns?: AddOnOption[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisines: string[];
  heroImage: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  priceRange: '$' | '$$' | '$$$';
  address: string;
  area: string;
  isOpen: boolean;
  promoBadge?: string;
  featuredDish?: string;
}

export interface CartItem {
  cartItemId: string;
  foodItem: FoodItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  selectedSize?: SizeOption;
  selectedAddOns: AddOnOption[];
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface RiderInfo {
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  photoUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  deliveryAddress: Address;
  status: OrderStatus;
  paymentMethod: 'cod' | 'card_demo';
  estimatedDeliveryTime: string;
  createdAt: string;
  rider?: RiderInfo;
}

export interface PromoCode {
  code: string;
  discountPercent: number; // e.g. 10 for 10%
  minOrder: number;
  maxDiscount?: number;
  description: string;
}

export type SortOption = 'rating' | 'deliveryTime' | 'popular' | 'priceLow';

