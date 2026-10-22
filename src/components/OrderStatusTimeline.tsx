import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { OrderStatus } from '../types';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { status: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { status: 'picked_up', label: 'Picked Up', icon: 'bicycle' },
  { status: 'on_the_way', label: 'On The Way', icon: 'navigate' },
  { status: 'delivered', label: 'Delivered', icon: 'home' },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ currentStatus }) => {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step.status} style={styles.stepItem}>
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isCompleted ? styles.circleCompleted : styles.circlePending,
                  isCurrent ? styles.circleCurrent : null,
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={16}
                  color={isCompleted ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    index < currentIndex ? styles.lineCompleted : styles.linePending,
                  ]}
                />
              )}
            </View>

            <View style={styles.textCol}>
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted ? styles.stepLabelCompleted : null,
                  isCurrent ? styles.stepLabelCurrent : null,
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.stepSubtitle}>
                {isCurrent
                  ? 'In progress'
                  : isCompleted
                  ? 'Completed'
                  : 'Pending'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 36,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: colors.primary,
  },
  circlePending: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  circleCurrent: {
    backgroundColor: colors.primaryDeep,
    transform: [{ scale: 1.1 }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  linePending: {
    backgroundColor: colors.border,
  },
  textCol: {
    flex: 1,
    paddingLeft: spacing.md,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  stepLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepLabelCompleted: {
    color: colors.textPrimary,
  },
  stepLabelCurrent: {
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  stepSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

