import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../theme';
import { useAppSelector } from '../store';
import { triggerHaptic } from '../utils/haptics';

export const TAB_BAR_PILL_HEIGHT = 56;
export const TAB_BAR_MIN_BOTTOM_MARGIN = 12;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const cartItems = useAppSelector((s) => s.cart.items);
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const getTabConfig = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case 'HomeTab':
        return {
          label: 'Home',
          iconName: isFocused ? 'restaurant' : 'restaurant-outline',
        };
      case 'ExploreTab':
        return {
          label: 'Explore',
          iconName: isFocused ? 'compass' : 'compass-outline',
        };
      case 'CartTab':
        return {
          label: 'Cart',
          iconName: isFocused ? 'bag-handle' : 'bag-handle-outline',
          badge: totalCartCount > 0 ? totalCartCount : null,
        };
      case 'OrdersTab':
        return {
          label: 'Orders',
          iconName: isFocused ? 'receipt' : 'receipt-outline',
        };
      case 'ProfileTab':
        return {
          label: 'Profile',
          iconName: isFocused ? 'person' : 'person-outline',
        };
      default:
        return {
          label: routeName,
          iconName: 'ellipse-outline',
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_MARGIN),
        },
      ]}
    >
      <View style={[styles.bar, shadows.floating]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = getTabConfig(route.name, isFocused);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              triggerHaptic('selection');
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || config.label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabButton, isFocused && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabContent,
                  isFocused ? styles.tabContentActive : null,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={config.iconName as any}
                    size={22}
                    color={isFocused ? colors.primary : colors.textMuted}
                  />
                  {config.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {config.badge > 99 ? '99+' : config.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {isFocused && (
                  <Text style={styles.activeLabel} numberOfLines={1}>
                    {config.label}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: TAB_BAR_PILL_HEIGHT / 2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    height: TAB_BAR_PILL_HEIGHT,
    width: '92%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    height: '100%',
  },
  tabButtonActive: {
    flex: 1.35,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    minHeight: 38,
  },
  tabContentActive: {
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.primaryDeep,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

