import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '../theme';
import { Address } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface LocationHeaderProps {
  address: Address | null;
  onPressAddress: () => void;
  onPressNotification?: () => void;
  hasUnreadNotifications?: boolean;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
  address,
  onPressAddress,
  onPressNotification,
  hasUnreadNotifications = true,
}) => {
  const handleAddressPress = () => {
    triggerHaptic('light');
    onPressAddress();
  };

  const handleNotificationPress = () => {
    if (onPressNotification) {
      triggerHaptic('light');
      onPressNotification();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationSelector}
        activeOpacity={0.7}
        onPress={handleAddressPress}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={18} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.deliverToText}>DELIVER TO</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {address ? `${address.title} - ${address.area}` : 'Select Delivery Location'}
          </Text>
        </View>
      </TouchableOpacity>

      {onPressNotification && (
        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.8}
          onPress={handleNotificationPress}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          {hasUnreadNotifications && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliverToText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  addressText: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});

