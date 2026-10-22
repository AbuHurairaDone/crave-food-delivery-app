import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { useAppDispatch } from '../../store';
import { storage } from '../../utils/storage';
import { hydrateAuth } from '../../store/slices/authSlice';
import { hydrateAddresses } from '../../store/slices/addressesSlice';
import { hydrateFavorites } from '../../store/slices/restaurantsSlice';
import { hydrateCart } from '../../store/slices/cartSlice';
import { hydrateOrders } from '../../store/slices/ordersSlice';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start brand reveal animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Hydrate state from local storage
    const loadStateAndNavigate = async () => {
      try {
        const [
          onboardingDone,
          savedUser,
          savedAddresses,
          savedFavRest,
          savedFavFood,
          savedCart,
          savedOrders,
        ] = await Promise.all([
          storage.getItem<boolean>(storage.KEYS.ONBOARDING_COMPLETED, false),
          storage.getItem<any>(storage.KEYS.AUTH_USER, null),
          storage.getItem<any>(storage.KEYS.SAVED_ADDRESSES, null),
          storage.getItem<string[]>(storage.KEYS.FAVORITE_RESTAURANTS, ['rest-1', 'rest-3']),
          storage.getItem<string[]>(storage.KEYS.FAVORITE_FOODS, ['food-101', 'food-301']),
          storage.getItem<any>(storage.KEYS.CART, null),
          storage.getItem<any>(storage.KEYS.ORDERS, null),
        ]);

        dispatch(
          hydrateAuth({
            user: savedUser,
            isOnboardingCompleted: onboardingDone,
          })
        );

        if (savedAddresses) {
          dispatch(hydrateAddresses(savedAddresses));
        }

        dispatch(
          hydrateFavorites({
            restaurantIds: savedFavRest,
            foodIds: savedFavFood,
          })
        );

        if (savedCart) {
          dispatch(hydrateCart(savedCart));
        }

        if (savedOrders) {
          dispatch(hydrateOrders(savedOrders));
        }

        // Brief delay for visual polish (800ms total)
        setTimeout(() => {
          if (!onboardingDone) {
            navigation.replace('Onboarding');
          } else if (savedUser) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Auth');
          }
        }, 800);
      } catch (e) {
        console.warn('Splash loading error', e);
        navigation.replace('Onboarding');
      }
    };

    loadStateAndNavigate();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="fast-food" size={54} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Crave</Text>
        <Text style={styles.subtitle}>Delivering Flavors of Lahore</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.2,
  },
});

