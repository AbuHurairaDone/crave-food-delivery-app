import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../theme';
import { CartItem } from '../types';
import { QuantityStepper } from './QuantityStepper';
import { triggerHaptic } from '../utils/haptics';

interface CartItemCardProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const [imgUri, setImgUri] = useState(item.foodItem.image);

  const customSummary = [
    item.selectedSize?.name,
    ...(item.selectedAddOns || []).map((a) => a.name),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.card, shadows.sm]}>
      <Image
        source={{ uri: imgUri }}
        onError={() => setImgUri('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80')}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.foodItem.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('warning');
              onRemove();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {customSummary ? (
          <Text style={styles.options} numberOfLines={2}>
            {customSummary}
          </Text>
        ) : null}

        {item.specialInstructions ? (
          <Text style={styles.instructions} numberOfLines={1}>
            Note: {item.specialInstructions}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={styles.price}>PKR {item.totalPrice}</Text>
          <QuantityStepper
            quantity={item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            size="sm"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    backgroundColor: '#EBE2D8',
  },
  details: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  options: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  instructions: {
    fontSize: typography.sizes.xs,
    color: colors.primaryDeep,
    fontStyle: 'italic',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});

