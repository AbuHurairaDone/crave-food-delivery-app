import React from 'react';
import {
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, shadows } from '../theme';
import { triggerHaptic } from '../utils/haptics';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: 'surface' | 'primary' | 'ghost' | 'bordered';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  variant = 'surface',
  style,
  disabled = false,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    if (disabled) return;
    triggerHaptic('light');
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    let backgroundColor: string = colors.surface;
    let borderWidth: number | undefined = undefined;
    let borderColor: string | undefined = undefined;

    switch (variant) {
      case 'primary':
        backgroundColor = colors.primary;
        break;
      case 'ghost':
        backgroundColor = 'transparent';
        break;
      case 'bordered':
        backgroundColor = colors.surface;
        borderWidth = 1;
        borderColor = colors.border;
        break;
      case 'surface':
      default:
        backgroundColor = colors.surface;
        break;
    }

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor,
      borderWidth,
      borderColor,
      opacity: disabled ? 0.5 : 1,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        getContainerStyle(),
        variant === 'surface' ? shadows.sm : undefined,
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};
