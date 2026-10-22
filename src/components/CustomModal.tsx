import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  primaryButtonTitle?: string;
  onPrimaryPress?: () => void;
  primaryButtonVariant?: 'primary' | 'danger';
  secondaryButtonTitle?: string;
  onSecondaryPress?: () => void;
  children?: React.ReactNode;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  description,
  iconName,
  iconColor = colors.primary,
  iconBgColor = colors.primarySoft,
  primaryButtonTitle = 'Confirm',
  onPrimaryPress,
  primaryButtonVariant = 'primary',
  secondaryButtonTitle = 'Cancel',
  onSecondaryPress,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialog, shadows.lg]}>
              {iconName && (
                <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                  <Ionicons name={iconName} size={30} color={iconColor} />
                </View>
              )}

              <Text style={styles.title}>{title}</Text>
              {description && <Text style={styles.description}>{description}</Text>}

              {children && <View style={styles.customContent}>{children}</View>}

              <View style={styles.buttonContainer}>
                {onPrimaryPress && (
                  <PrimaryButton
                    title={primaryButtonTitle}
                    onPress={onPrimaryPress}
                    variant={primaryButtonVariant}
                    size="md"
                    style={styles.actionBtn}
                  />
                )}
                {onSecondaryPress && (
                  <PrimaryButton
                    title={secondaryButtonTitle}
                    onPress={onSecondaryPress}
                    variant="ghost"
                    size="md"
                    style={styles.actionBtn}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  customContent: {
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.xs,
  },
  actionBtn: {
    width: '100%',
  },
});

