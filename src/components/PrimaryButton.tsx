import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radii, shadows } from '../theme';
import { triggerHaptic } from '../utils/haptics';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  gradient = false,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic('light');
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    let minHeight = 50;
    let paddingHorizontal = 24;

    switch (size) {
      case 'sm':
        minHeight = 40;
        paddingHorizontal = 16;
        break;
      case 'lg':
        minHeight = 56;
        paddingHorizontal = 28;
        break;
      case 'md':
      default:
        minHeight = 50;
        paddingHorizontal = 24;
        break;
    }

    let backgroundColor: string = 'transparent';
    let borderWidth: number | undefined = undefined;
    let borderColor: string | undefined = undefined;

    switch (variant) {
      case 'secondary':
        backgroundColor = colors.primarySoft;
        break;
      case 'outline':
        backgroundColor = 'transparent';
        borderWidth = 1.5;
        borderColor = colors.primary;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        break;
      case 'danger':
        backgroundColor = colors.error;
        break;
      case 'primary':
      default:
        if (!gradient) {
          backgroundColor = colors.primary;
        }
        break;
    }

    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.full,
      minHeight,
      paddingHorizontal,
      backgroundColor,
      borderWidth,
      borderColor,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    let textColor = colors.surface;
    switch (variant) {
      case 'secondary':
        textColor = colors.primaryDeep;
        break;
      case 'outline':
        textColor = colors.primary;
        break;
      case 'ghost':
        textColor = colors.textSecondary;
        break;
      default:
        textColor = '#FFFFFF';
        break;
    }

    let fontSize = typography.sizes.md;
    if (size === 'sm') fontSize = typography.sizes.sm;
    if (size === 'lg') fontSize = typography.sizes.lg;

    return {
      color: textColor,
      fontSize,
      fontWeight: '700',
      textAlign: 'center',
    };
  };

  const renderContent = () => (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  if (variant === 'primary' && gradient && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.gradientWrapper, shadows.md, style]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getContainerStyle(), styles.gradientInner]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        getContainerStyle(),
        variant === 'primary' ? shadows.sm : undefined,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: 8,
  },
  rightIconWrapper: {
    marginLeft: 8,
  },
  gradientWrapper: {
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  gradientInner: {
    width: '100%',
  },
});
