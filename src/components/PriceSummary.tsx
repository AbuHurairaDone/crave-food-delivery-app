import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../theme';
import { PromoCode } from '../types';

interface PriceSummaryProps {
  subtotal: number;
  deliveryFee: number;
  promo?: PromoCode | null;
  onRemovePromo?: () => void;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({
  subtotal,
  deliveryFee,
  promo,
  onRemovePromo,
}) => {
  let discountAmount = 0;
  if (promo) {
    const rawDiscount = (subtotal * promo.discountPercent) / 100;
    discountAmount = promo.maxDiscount
      ? Math.min(rawDiscount, promo.maxDiscount)
      : rawDiscount;
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Summary</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>PKR {subtotal}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery Fee</Text>
        <Text style={styles.value}>
          {deliveryFee === 0 ? 'FREE' : `PKR ${deliveryFee}`}
        </Text>
      </View>

      {promo && (
        <View style={styles.row}>
          <View style={styles.promoLabelRow}>
            <Text style={[styles.label, styles.discountText]}>
              Discount ({promo.code})
            </Text>
            {onRemovePromo && (
              <TouchableOpacity
                onPress={onRemovePromo}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.value, styles.discountText]}>
            -PKR {Math.round(discountAmount)}
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>PKR {Math.round(finalTotal)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  promoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    color: colors.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
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
});

