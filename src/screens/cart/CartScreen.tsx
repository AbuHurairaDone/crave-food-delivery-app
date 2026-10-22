import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CartItemCard } from '../../components/CartItemCard';
import { PriceSummary } from '../../components/PriceSummary';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { CustomModal } from '../../components/CustomModal';
import { CustomToast } from '../../components/CustomToast';
import { TabScreenSpacer } from '../../components/TabScreenSpacer';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  updateQuantity,
  removeFromCart,
  applyPromoCode,
  removePromoCode,
  clearCart,
} from '../../store/slices/cartSlice';
import { MOCK_PROMO_CODES } from '../../data/mockData';
import { triggerHaptic } from '../../utils/haptics';

type CartScreenNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CartTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavProp>();
  const dispatch = useAppDispatch();

  const { items, restaurantName, deliveryFee, appliedPromo } = useAppSelector(
    (s) => s.cart
  );

  const [promoInput, setPromoInput] = useState('');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) return;

    triggerHaptic('light');
    dispatch(applyPromoCode(code));

    // Check if promo was applied
    const promo = MOCK_PROMO_CODES.find((p) => p.code === code);
    if (!promo) {
      setToastMessage({ message: 'Invalid promo code. Try "CRAVE10" for 10% off.', type: 'error' });
      triggerHaptic('error');
    } else if (subtotal < promo.minOrder) {
      setToastMessage({
        message: `Minimum order amount of PKR ${promo.minOrder} required for ${promo.code}.`,
        type: 'error',
      });
      triggerHaptic('error');
    } else {
      setToastMessage({ message: `Promo code ${promo.code} applied successfully!`, type: 'success' });
      triggerHaptic('success');
      setPromoInput('');
    }
  };

  const handleRemoveItemConfirm = () => {
    if (itemToRemove) {
      triggerHaptic('light');
      dispatch(removeFromCart(itemToRemove));
      setItemToRemove(null);
    }
  };

  const handleClearAll = () => {
    triggerHaptic('warning');
    dispatch(clearCart());
    setClearCartModalVisible(false);
  };

  if (items.length === 0) {
    return (
      <AppScreen safeTop safeBottom={false}>
        <CustomHeader showBack={false} title="Your Cart" />
        <EmptyState
          iconName="bag-outline"
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore Lahore's finest restaurants!"
          actionTitle="Explore Restaurants"
          onActionPress={() => navigation.navigate('HomeTab')}
          style={{ flex: 1 }}
        />
        <TabScreenSpacer />
      </AppScreen>
    );
  }

  return (
    <AppScreen safeTop safeBottom={false} scrollable keyboardAvoiding contentContainerStyle={styles.scrollContent}>
      <CustomHeader
        showBack={false}
        title="Your Cart"
        rightAction={
          <TouchableOpacity
            onPress={() => setClearCartModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        }
      />

      {/* Restaurant Header Banner */}
      <View style={styles.restaurantBanner}>
        <View style={styles.restIconCircle}>
          <Ionicons name="restaurant" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderingFromLabel}>ORDERING FROM</Text>
          <Text style={styles.restNameText}>{restaurantName || 'Restaurant'}</Text>
        </View>
      </View>

      {/* Cart Items List */}
      <View style={styles.itemsSection}>
        {items.map((item) => (
          <CartItemCard
            key={item.cartItemId}
            item={item}
            onIncrement={() =>
              dispatch(
                updateQuantity({
                  cartItemId: item.cartItemId,
                  quantity: item.quantity + 1,
                })
              )
            }
            onDecrement={() => {
              if (item.quantity === 1) {
                setItemToRemove(item.cartItemId);
              } else {
                dispatch(
                  updateQuantity({
                    cartItemId: item.cartItemId,
                    quantity: item.quantity - 1,
                  })
                );
              }
            }}
            onRemove={() => setItemToRemove(item.cartItemId)}
          />
        ))}
      </View>

      {/* Promo Code Section */}
      <View style={styles.promoSection}>
        <Text style={styles.promoHeading}>Promo Code</Text>
        <View style={styles.promoInputRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="Enter promo code (e.g. CRAVE10)"
            placeholderTextColor={colors.textMuted}
            value={promoInput}
            onChangeText={setPromoInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyBtn, !promoInput.trim() ? styles.applyBtnDisabled : null]}
            onPress={() => handleApplyPromo()}
            disabled={!promoInput.trim()}
          >
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Promo Suggestion Chips */}
        {!appliedPromo && (
          <View style={styles.promoSuggestions}>
            <Text style={styles.suggestLabel}>Tap demo code to apply:</Text>
            <View style={styles.suggestChipsRow}>
              {MOCK_PROMO_CODES.map((p) => (
                <TouchableOpacity
                  key={p.code}
                  style={styles.suggestChip}
                  onPress={() => handleApplyPromo(p.code)}
                >
                  <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
                  <Text style={styles.suggestChipText}>{p.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Price Summary Breakdown */}
      <View style={styles.summarySection}>
        <PriceSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          promo={appliedPromo}
          onRemovePromo={() => dispatch(removePromoCode())}
        />

        <PrimaryButton
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          variant="primary"
          size="lg"
          gradient
          style={styles.checkoutBtn}
        />
      </View>

      <TabScreenSpacer />

      {/* Toast Feedback */}
      <CustomToast
        visible={!!toastMessage}
        message={toastMessage?.message || ''}
        type={toastMessage?.type || 'info'}
        onHide={() => setToastMessage(null)}
      />

      {/* Clear Cart Modal */}
      <CustomModal
        visible={clearCartModalVisible}
        onClose={() => setClearCartModalVisible(false)}
        iconName="trash-outline"
        iconColor={colors.error}
        iconBgColor={colors.errorSoft}
        title="Clear Cart?"
        description="Are you sure you want to remove all items from your cart?"
        primaryButtonTitle="Clear All"
        primaryButtonVariant="danger"
        onPrimaryPress={handleClearAll}
        secondaryButtonTitle="Cancel"
        onSecondaryPress={() => setClearCartModalVisible(false)}
      />

      {/* Remove Single Item Confirmation Modal */}
      <CustomModal
        visible={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        iconName="trash-outline"
        iconColor={colors.error}
        iconBgColor={colors.errorSoft}
        title="Remove Item?"
        description="Do you want to remove this customized dish from your cart?"
        primaryButtonTitle="Remove"
        primaryButtonVariant="danger"
        onPrimaryPress={handleRemoveItemConfirm}
        secondaryButtonTitle="Keep"
        onSecondaryPress={() => setItemToRemove(null)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  clearText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.error,
    paddingRight: 4,
  },
  restaurantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  restIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  orderingFromLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.8,
  },
  restNameText: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  itemsSection: {
    paddingHorizontal: spacing.md,
  },
  promoSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  promoHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  promoInput: {
    flex: 1,
    height: 46,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    opacity: 0.5,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: typography.sizes.sm,
  },
  promoSuggestions: {
    marginTop: spacing.sm,
  },
  suggestLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  suggestChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  suggestChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  summarySection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  checkoutBtn: {
    marginTop: spacing.xs,
  },
});

