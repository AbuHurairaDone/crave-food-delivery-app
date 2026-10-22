import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RestaurantDetailsScreen } from '../screens/restaurant/RestaurantDetailsScreen';
import { FoodDetailsScreen } from '../screens/food/FoodDetailsScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/orders/OrderConfirmationScreen';
import { OrderTrackingScreen } from '../screens/orders/OrderTrackingScreen';
import { SavedAddressesScreen } from '../screens/address/SavedAddressesScreen';
import { AddEditAddressScreen } from '../screens/address/AddEditAddressScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="RestaurantDetails"
        component={RestaurantDetailsScreen as any}
      />
      <Stack.Screen
        name="FoodDetails"
        component={FoodDetailsScreen as any}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen as any}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen as any}
      />
      <Stack.Screen
        name="SavedAddresses"
        component={SavedAddressesScreen as any}
      />
      <Stack.Screen
        name="AddEditAddress"
        component={AddEditAddressScreen as any}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
};

