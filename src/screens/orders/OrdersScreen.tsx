import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomModal } from '../../components/CustomModal';
import { TabScreenSpacer } from '../../components/TabScreenSpacer';
import { useAppDispatch, useAppSelector } from '../../store';
import { addToCart, resolveConflictReplace, dismissConflict } from '../../store/slices/cartSlice';
import { Order } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type OrdersScreenNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'OrdersTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<OrdersScreenNavProp>();
  const dispatch = useAppDispatch();

  const { activeOrders, pastOrders } = useAppSelector((s) => s.orders);
  const cartState = useAppSelector((s) => s.cart);

  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const handleReorder = (order: Order) => {
    triggerHaptic('success');
    order.items.forEach((item) => {
      dispatch(
        addToCart({
          foodItem: item.foodItem,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedAddOns: item.selectedAddOns,
          specialInstructions: item.specialInstructions,
          restaurantName: order.restaurantName,
          deliveryFee: order.deliveryFee,
        })
      );
    });

    if (
      !cartState.restaurantId ||
      cartState.restaurantId === order.restaurantId ||
      cartState.items.length === 0
    ) {
      navigation.navigate('CartTab');
    }
  };

  const currentList = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <AppScreen safeTop safeBottom={false} scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader showBack={false} title="My Orders" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' ? styles.tabBtnActive : null]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveTab('active');
          }}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'active' ? styles.tabBtnTextActive : null,
            ]}
          >
            Active Orders ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'past' ? styles.tabBtnActive : null]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveTab('past');
          }}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'past' ? styles.tabBtnTextActive : null,
            ]}
          >
            Past Orders ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <View style={styles.listContainer}>
        {currentList.length > 0 ? (
          currentList.map((order) => {
            const itemCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
            const firstItemName = order.items[0]?.foodItem.name || 'Dish';
            const itemSummary =
              order.items.length > 1
                ? `${firstItemName} + ${order.items.length - 1} more items`
                : `${firstItemName} (${itemCount}x)`;

            return (
              <View key={order.id} style={[styles.orderCard, shadows.sm]}>
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: order.restaurantImage }}
                    style={styles.restImage}
                    resizeMode="cover"
                  />
                  <View style={styles.restInfo}>
                    <Text style={styles.restName} numberOfLines={1}>
                      {order.restaurantName}
                    </Text>
                    <Text style={styles.orderNumber}>{order.orderNumber} • {order.createdAt}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      order.status === 'delivered' ? styles.statusDelivered : styles.statusActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        order.status === 'delivered'
                          ? styles.statusDeliveredText
                          : styles.statusActiveText,
                      ]}
                    >
                      {order.status === 'delivered'
                        ? 'Delivered'
                        : order.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.itemsSummary} numberOfLines={1}>
                    {itemSummary}
                  </Text>
                  <Text style={styles.totalPrice}>PKR {order.total}</Text>
                </View>

                <View style={styles.cardFooter}>
                  {activeTab === 'active' ? (
                    <PrimaryButton
                      title="Track Order"
                      onPress={() =>
                        navigation.navigate('OrderTracking', { orderId: order.id })
                      }
                      variant="primary"
                      size="sm"
                      gradient
                      leftIcon={<Ionicons name="navigate-outline" size={16} color="#FFFFFF" />}
                      style={{ flex: 1 }}
                    />
                  ) : (
                    <PrimaryButton
                      title="Reorder"
                      onPress={() => handleReorder(order)}
                      variant="outline"
                      size="sm"
                      leftIcon={<Ionicons name="repeat" size={16} color={colors.primary} />}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            iconName="receipt-outline"
            title={activeTab === 'active' ? 'No Active Orders' : 'No Past Orders'}
            description={
              activeTab === 'active'
                ? 'You do not have any orders in progress. Order some delicious food now!'
                : 'Your completed food delivery orders will appear here.'
            }
            actionTitle={activeTab === 'active' ? 'Order Food Now' : undefined}
            onActionPress={activeTab === 'active' ? () => navigation.navigate('HomeTab') : undefined}
          />
        )}
      </View>

      <TabScreenSpacer />

      {/* Cart Conflict Modal */}
      <CustomModal
        visible={cartState.conflictModalVisible}
        onClose={() => dispatch(dismissConflict())}
        iconName="alert-circle"
        iconColor={colors.warning}
        iconBgColor={colors.warningSoft}
        title="Start New Order?"
        description={`Your cart currently contains items from "${cartState.pendingConflict?.currentRestaurantName}". Would you like to clear the cart and reorder from "${cartState.pendingConflict?.newRestaurantName}"?`}
        primaryButtonTitle="Clear Cart & Reorder"
        onPrimaryPress={() => {
          triggerHaptic('success');
          dispatch(resolveConflictReplace());
          navigation.navigate('CartTab');
        }}
        secondaryButtonTitle="Keep Current Cart"
        onSecondaryPress={() => dispatch(dismissConflict())}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 24,
    padding: 3,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#362415',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restImage: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#EBE2D8',
    marginRight: spacing.sm,
  },
  restInfo: {
    flex: 1,
    marginRight: 6,
  },
  restName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderNumber: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  statusActive: {
    backgroundColor: colors.primarySoft,
  },
  statusDelivered: {
    backgroundColor: colors.successSoft,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusActiveText: {
    color: colors.primaryDeep,
  },
  statusDeliveredText: {
    color: colors.success,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  itemsSummary: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  totalPrice: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
});

