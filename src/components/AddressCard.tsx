import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../theme';
import { Address } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  style,
}) => {
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (address.label) {
      case 'Home':
        return 'home';
      case 'Work':
        return 'briefcase';
      case 'Other':
      default:
        return 'location';
    }
  };

  const handlePress = () => {
    if (onSelect) {
      triggerHaptic('selection');
      onSelect();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onSelect ? 0.8 : 1}
      onPress={handlePress}
      style={[
        styles.card,
        shadows.sm,
        isSelected ? styles.cardSelected : undefined,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, isSelected ? styles.iconCircleSelected : null]}>
            <Ionicons
              name={getIconName()}
              size={18}
              color={isSelected ? colors.primary : colors.textPrimary}
            />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{address.title}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{address.label}</Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedCheck}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </View>
        )}
      </View>

      <Text style={styles.addressLine}>{address.street}</Text>
      <Text style={styles.areaLine}>
        {address.area}, {address.city}
      </Text>

      {address.note ? (
        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.noteText} numberOfLines={2}>
            {address.note}
          </Text>
        </View>
      ) : null}

      {(onEdit || onDelete) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                triggerHaptic('light');
                onEdit();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil" size={14} color={colors.textSecondary} />
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                triggerHaptic('warning');
                onDelete();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={14} color={colors.error} />
              <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFAF6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconCircleSelected: {
    backgroundColor: colors.primarySoft,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedCheck: {
    marginLeft: spacing.xs,
  },
  addressLine: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    marginTop: 6,
    lineHeight: 18,
  },
  areaLine: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    marginTop: spacing.xs,
    gap: 6,
  },
  noteText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs,
    marginTop: spacing.sm,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

