import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppSelector } from '../../store';
import { triggerHaptic } from '../../utils/haptics';

type OrderConfirmationRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;

export const OrderConfirmationScreen: React.FC<{
  route: OrderConfirmationRouteProp;
}> = ({ route }) => {
  const { orderId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const order = useAppSelector((s) =>
    s.orders.activeOrders.find((o) => o.id === orderId)
  );

  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    triggerHaptic('success');
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalItemsCount = order?.items.reduce((acc, curr) => acc + curr.quantity, 0) || 1;

  return (
    <AppScreen safeTop safeBottom scrollable contentContainerStyle={styles.scrollContent}>
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been received by {order?.restaurantName || 'the restaurant'} and is being prepared with love.
        </Text>
      </Animated.View>

      {/* Order Info Card */}
      <View style={[styles.card, shadows.md]}>
        <View style={styles.orderNumberRow}>
          <View>
            <Text style={styles.cardLabel}>ORDER NUMBER</Text>
            <Text style={styles.orderNumberText}>{order?.orderNumber || 'CRV-10293'}</Text>
          </View>
          <View style={styles.etaBadge}>
            <Ionicons name="time-outline" size={14} color={colors.primaryDeep} />
            <Text style={styles.etaText}>{order?.estimatedDeliveryTime || '30-40 mins'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Restaurant</Text>
          <Text style={styles.detailsValue}>{order?.restaurantName}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Items Ordered</Text>
          <Text style={styles.detailsValue}>{totalItemsCount} items</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Payment</Text>
          <Text style={styles.detailsValue}>
            {order?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Simulated Card'}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsLabel}>Delivery To</Text>
          <Text style={styles.detailsValue} numberOfLines={1}>
            {order?.deliveryAddress.title} ({order?.deliveryAddress.area})
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>PKR {order?.total}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <PrimaryButton
          title="Track Live Order"
          onPress={() => navigation.replace('OrderTracking', { orderId })}
          variant="primary"
          size="lg"
          gradient
          leftIcon={<Ionicons name="navigate-outline" size={20} color="#FFFFFF" />}
        />

        <PrimaryButton
          title="Back to Home"
          onPress={() => navigation.navigate('MainTabs')}
          variant="ghost"
          size="md"
        />
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  animatedHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    elevation: 6,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  orderNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  orderNumberText: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.primaryDeep,
    marginTop: 2,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  etaText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  detailsValue: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.xs,
  },
});

