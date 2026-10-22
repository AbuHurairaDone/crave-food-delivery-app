import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii } from '../theme';
import { triggerHaptic } from '../utils/haptics';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const btnSize = isSm ? 28 : isLg ? 40 : 34;
  const iconSize = isSm ? 14 : isLg ? 18 : 16;

  const handleMinus = () => {
    if (quantity > min) {
      triggerHaptic('light');
      onDecrement();
    }
  };

  const handlePlus = () => {
    if (quantity < max) {
      triggerHaptic('light');
      onIncrement();
    }
  };

  return (
    <View style={[styles.container, isSm ? styles.smContainer : null]}>
      <TouchableOpacity
        onPress={handleMinus}
        disabled={quantity <= min}
        style={[
          styles.button,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          quantity <= min ? styles.buttonDisabled : null,
        ]}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons
          name="remove"
          size={iconSize}
          color={quantity <= min ? colors.textMuted : colors.textPrimary}
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.quantityText,
          isSm ? styles.smQuantityText : isLg ? styles.lgQuantityText : null,
        ]}
      >
        {quantity}
      </Text>

      <TouchableOpacity
        onPress={handlePlus}
        disabled={quantity >= max}
        style={[
          styles.button,
          styles.plusButton,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          quantity >= max ? styles.buttonDisabled : null,
        ]}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="add" size={iconSize} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  smContainer: {
    padding: 2,
  },
  button: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  quantityText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 12,
    minWidth: 18,
    textAlign: 'center',
  },
  smQuantityText: {
    fontSize: typography.sizes.sm,
    marginHorizontal: 8,
  },
  lgQuantityText: {
    fontSize: typography.sizes.lg,
    marginHorizontal: 16,
  },
});

