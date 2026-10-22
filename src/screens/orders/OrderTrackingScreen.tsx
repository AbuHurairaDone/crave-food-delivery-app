import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { OrderStatusTimeline } from '../../components/OrderStatusTimeline';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomToast } from '../../components/CustomToast';
import { useAppDispatch, useAppSelector } from '../../store';
import { advanceOrderStatus } from '../../store/slices/ordersSlice';
import { triggerHaptic } from '../../utils/haptics';

type OrderTrackingRouteProp = RouteProp<RootStackParamList, 'OrderTracking'>;

export const OrderTrackingScreen: React.FC<{
  route: OrderTrackingRouteProp;
}> = ({ route }) => {
  const { orderId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const activeOrder = useAppSelector((s) =>
    s.orders.activeOrders.find((o) => o.id === orderId)
  );
  const pastOrder = useAppSelector((s) =>
    s.orders.pastOrders.find((o) => o.id === orderId)
  );

  const order = activeOrder || pastOrder;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!order) {
    return (
      <AppScreen safeTop safeBottom>
        <CustomHeader showBack onBack={() => navigation.goBack()} title="Order Tracking" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
          <PrimaryButton
            title="Go to Orders"
            onPress={() => navigation.navigate('MainTabs', { screen: 'OrdersTab' })}
          />
        </View>
      </AppScreen>
    );
  }

  const handleAdvanceStatus = () => {
    triggerHaptic('success');
    dispatch(advanceOrderStatus(order.id));
  };

  const handleDemoCall = () => {
    triggerHaptic('light');
    setToastMessage(`Simulated Call: Dialing rider ${order.rider?.name || 'Usman'} at ${order.rider?.phone || '+92 300 1234567'}...`);
  };

  const handleDemoChat = () => {
    triggerHaptic('light');
    setToastMessage(`Simulated Chat: Message sent to ${order.rider?.name || 'Rider'}: "Please leave at front gate."`);
  };

  return (
    <AppScreen safeTop safeBottom scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader
        showBack
        onBack={() => navigation.goBack()}
        title="Live Order Tracking"
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.doneLink}>Done</Text>
          </TouchableOpacity>
        }
      />

      {/* Stylized Visual Route Map (Demo Tracking) */}
      <View style={[styles.mapGraphicCard, shadows.sm]}>
        <View style={styles.demoMapBadge}>
          <Text style={styles.demoMapBadgeText}>DEMO ROUTE TRACKING</Text>
        </View>

        {/* Visual Road / Route SVG-like styling */}
        <View style={styles.routeVisual}>
          <View style={styles.routePoint}>
            <View style={[styles.routeIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="restaurant" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.routePointText}>{order.restaurantName}</Text>
          </View>

          <View style={styles.routeLineContainer}>
            <View style={styles.routeLine} />
            <View style={styles.riderBicycleIcon}>
              <Ionicons name="bicycle" size={18} color={colors.primaryDeep} />
            </View>
          </View>

          <View style={styles.routePoint}>
            <View style={[styles.routeIcon, { backgroundColor: colors.success }]}>
              <Ionicons name="home" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.routePointText}>{order.deliveryAddress.title}</Text>
          </View>
        </View>

        <Text style={styles.mapSubtext}>
          Simulated GPS trajectory across Gulberg / Lahore. No paid map API required.
        </Text>
      </View>

      {/* Status & ETA Card */}
      <View style={[styles.card, shadows.sm]}>
        <View style={styles.etaHeader}>
          <View>
            <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
            <Text style={styles.etaTime}>
              {order.status === 'delivered' ? 'Delivered 🎉' : '20-25 Minutes'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {order.status.toUpperCase().replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Timeline Component */}
        <OrderStatusTimeline currentStatus={order.status} />

        {/* Demo Advance Status Control */}
        {order.status !== 'delivered' && (
          <View style={styles.demoControlBox}>
            <View style={styles.demoControlHeader}>
              <Ionicons name="flash" size={16} color={colors.primaryDeep} />
              <Text style={styles.demoControlTitle}>Demo Simulation Controls</Text>
            </View>
            <Text style={styles.demoControlSubtitle}>
              Tap below to advance order step in real-time:
            </Text>
            <PrimaryButton
              title="Advance Order Status ➔"
              onPress={handleAdvanceStatus}
              variant="secondary"
              size="sm"
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </View>

      {/* Rider Info Card */}
      {order.rider && (
        <View style={[styles.card, shadows.sm]}>
          <Text style={styles.cardHeading}>Your Delivery Partner</Text>

          <View style={styles.riderRow}>
            <Image
              source={{ uri: order.rider.photoUrl }}
              style={styles.riderPhoto}
              resizeMode="cover"
            />

            <View style={styles.riderDetails}>
              <Text style={styles.riderName}>{order.rider.name}</Text>
              <Text style={styles.riderVehicle}>{order.rider.vehicle}</Text>
              <View style={styles.riderRatingRow}>
                <Ionicons name="star" size={13} color={colors.star} />
                <Text style={styles.riderRatingText}>{order.rider.rating.toFixed(1)} rating</Text>
              </View>
            </View>

            <View style={styles.riderActions}>
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={handleDemoCall}
                accessibilityLabel="Call rider"
              >
                <Ionicons name="call" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={handleDemoChat}
                accessibilityLabel="Message rider"
              >
                <Ionicons name="chatbubble-ellipses" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Order Item Details */}
      <View style={[styles.card, shadows.sm]}>
        <Text style={styles.cardHeading}>Order Details ({order.orderNumber})</Text>
        {order.items.map((item, idx) => (
          <View key={idx} style={styles.orderItemRow}>
            <Text style={styles.itemQty}>{item.quantity}x</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.foodItem.name}</Text>
              {item.selectedSize && (
                <Text style={styles.itemSub}>{item.selectedSize.name}</Text>
              )}
            </View>
            <Text style={styles.itemPrice}>PKR {item.totalPrice}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>PKR {order.total}</Text>
        </View>
      </View>

      <CustomToast
        visible={!!toastMessage}
        message={toastMessage || ''}
        type="info"
        onHide={() => setToastMessage(null)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  doneLink: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
    paddingRight: 4,
  },
  mapGraphicCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: radii.xxl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    position: 'relative',
  },
  demoMapBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  demoMapBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  routeVisual: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  routePoint: {
    alignItems: 'center',
    maxWidth: 90,
  },
  routeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    elevation: 3,
  },
  routePointText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  routeLineContainer: {
    flex: 1,
    height: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  routeLine: {
    width: '100%',
    height: 3,
    backgroundColor: colors.primaryMuted,
    borderStyle: 'dashed',
  },
  riderBicycleIcon: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.primary,
    elevation: 2,
  },
  mapSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeading: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  etaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.8,
  },
  etaTime: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  demoControlBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  demoControlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoControlTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  demoControlSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EBE2D8',
    marginRight: spacing.sm,
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  riderVehicle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  riderRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  riderRatingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  itemQty: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
    width: 28,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
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
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});

