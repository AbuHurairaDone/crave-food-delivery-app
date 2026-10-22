import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { AddressCard } from '../../components/AddressCard';
import { PriceSummary } from '../../components/PriceSummary';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomToast } from '../../components/CustomToast';
import { useAppDispatch, useAppSelector } from '../../store';
import { createOrder } from '../../store/slices/ordersSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { Order } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type CheckoutScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Checkout'>;
};

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const selectedAddress = useAppSelector((s) => s.addresses.selectedAddress);
  const cartState = useAppSelector((s) => s.cart);
  const restaurant = useAppSelector((s) =>
    s.restaurants.restaurants.find((r) => r.id === cartState.restaurantId)
  );

  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card_demo'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const subtotal = cartState.items.reduce((acc, curr) => acc + curr.totalPrice, 0);

  let discountAmount = 0;
  if (cartState.appliedPromo) {
    const rawDiscount = (subtotal * cartState.appliedPromo.discountPercent) / 100;
    discountAmount = cartState.appliedPromo.maxDiscount
      ? Math.min(rawDiscount, cartState.appliedPromo.maxDiscount)
      : rawDiscount;
  }

  const finalTotal = Math.max(0, subtotal + cartState.deliveryFee - discountAmount);

  const handlePlaceOrder = () => {
    if (isSubmitting) return;

    if (!selectedAddress) {
      setToastMessage('Please select a delivery address before placing order');
      triggerHaptic('error');
      return;
    }

    if (cartState.items.length === 0) {
      setToastMessage('Your cart is empty');
      triggerHaptic('error');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('success');

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `CRV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      restaurantId: cartState.restaurantId || 'rest-1',
      restaurantName: cartState.restaurantName || 'Restaurant',
      restaurantImage:
        restaurant?.heroImage ||
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
      items: [...cartState.items],
      subtotal,
      deliveryFee: cartState.deliveryFee,
      discount: discountAmount,
      total: Math.round(finalTotal),
      promoCode: cartState.appliedPromo?.code,
      deliveryAddress: {
        ...selectedAddress,
        note: deliveryNote.trim() ? deliveryNote.trim() : selectedAddress.note,
      },
      status: 'confirmed',
      paymentMethod,
      estimatedDeliveryTime: '30-40 mins',
      createdAt: 'Just now',
      rider: {
        name: 'Babar Ali',
        phone: '+92 312 9988776',
        rating: 4.9,
        vehicle: 'Honda CG 125 (LEA-7781)',
        photoUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    };

    setTimeout(() => {
      // Save order and clear cart
      dispatch(createOrder(newOrder));
      dispatch(clearCart());
      setIsSubmitting(false);

      navigation.replace('OrderConfirmation', { orderId });
    }, 700);
  };

  return (
    <AppScreen safeTop safeBottom scrollable keyboardAvoiding contentContainerStyle={styles.scrollContent}>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Checkout" />

      {/* Delivery Address Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SavedAddresses', { selectMode: true })}
          >
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

        {selectedAddress ? (
          <AddressCard address={selectedAddress} isSelected />
        ) : (
          <TouchableOpacity
            style={styles.addAddressBox}
            onPress={() => navigation.navigate('AddEditAddress', { isNew: true })}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.addAddressText}>Add Delivery Address</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Delivery Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Instructions</Text>
        <View style={styles.noteInputBox}>
          <Ionicons name="chatbox-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Ring doorbell, leave at front gate, call on arrival"
            placeholderTextColor={colors.textMuted}
            value={deliveryNote}
            onChangeText={setDeliveryNote}
          />
        </View>
      </View>

      {/* Payment Method Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'cod' ? styles.paymentOptionActive : null,
          ]}
          onPress={() => {
            triggerHaptic('selection');
            setPaymentMethod('cod');
          }}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIconCircle}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD)</Text>
              <Text style={styles.paymentSubtitle}>Pay with cash when your food arrives</Text>
            </View>
          </View>
          <View style={[styles.radioCircle, paymentMethod === 'cod' ? styles.radioActive : null]}>
            {paymentMethod === 'cod' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'card_demo' ? styles.paymentOptionActive : null,
          ]}
          onPress={() => {
            triggerHaptic('selection');
            setPaymentMethod('card_demo');
          }}
        >
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIconCircle}>
              <Ionicons name="card-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <View style={styles.demoCardTagRow}>
                <Text style={styles.paymentTitle}>Simulated Card</Text>
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>DEMO</Text>
                </View>
              </View>
              <Text style={styles.paymentSubtitle}>Instant simulated card payment (no real charges)</Text>
            </View>
          </View>
          <View
            style={[styles.radioCircle, paymentMethod === 'card_demo' ? styles.radioActive : null]}
          >
            {paymentMethod === 'card_demo' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <PriceSummary
          subtotal={subtotal}
          deliveryFee={cartState.deliveryFee}
          promo={cartState.appliedPromo}
        />
      </View>

      {/* Place Order CTA */}
      <View style={styles.bottomCtaSection}>
        <PrimaryButton
          title={isSubmitting ? 'Placing Order...' : `Place Order • PKR ${Math.round(finalTotal)}`}
          onPress={handlePlaceOrder}
          variant="primary"
          size="lg"
          loading={isSubmitting}
          gradient
        />
      </View>

      <CustomToast
        visible={!!toastMessage}
        message={toastMessage || ''}
        type="error"
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  changeLink: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  addAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  addAddressText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  noteInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    height: 50,
    gap: 8,
  },
  noteInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: spacing.xs,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFAF6',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paymentSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  demoCardTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBadge: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.xs,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  bottomCtaSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
});

