import { NavigatorScreenParams } from '@react-navigation/native';
import { Address } from './index';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerificationCode: { email: string; mockCode: string };
  ResetPassword: { email: string };
  LocationSetup: { isFromSignup?: boolean } | undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RestaurantDetails: { restaurantId: string };
  FoodDetails: { foodItemId: string; restaurantId: string };
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  SavedAddresses: { selectMode?: boolean } | undefined;
  AddEditAddress: { addressId?: string; initialAddress?: Partial<Address>; isNew?: boolean } | undefined;
  Favorites: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;
};

