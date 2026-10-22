import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { AuthStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomModal } from '../../components/CustomModal';
import { triggerHaptic } from '../../utils/haptics';

type ResetPasswordProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
  route: RouteProp<AuthStackParamList, 'ResetPassword'>;
};

export const ResetPasswordScreen: React.FC<ResetPasswordProps> = ({
  navigation,
  route,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newPassword) {
      errs.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    if (!validate()) {
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    triggerHaptic('light');

    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      setSuccessModalVisible(true);
    }, 500);
  };

  return (
    <AppScreen safeBottom safeTop keyboardAvoiding>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Set New Password" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.primary} />
        </View>

        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your new password must be different from previous passwords.
        </Text>

        <CustomTextInput
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
          }}
          isPassword
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          error={errors.newPassword}
          helperText="At least 6 characters"
        />

        <CustomTextInput
          label="Confirm New Password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
          }}
          isPassword
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          error={errors.confirmPassword}
        />

        <PrimaryButton
          title="Update Password"
          onPress={handleReset}
          variant="primary"
          size="lg"
          loading={loading}
          gradient
          style={styles.updateBtn}
        />
      </ScrollView>

      {/* Success Modal */}
      <CustomModal
        visible={successModalVisible}
        onClose={() => {
          setSuccessModalVisible(false);
          navigation.navigate('Login');
        }}
        iconName="checkmark-circle"
        iconColor={colors.success}
        iconBgColor={colors.successSoft}
        title="Password Updated!"
        description="Your password has been successfully reset in this demonstration. You can now log in."
        primaryButtonTitle="Back to Login"
        onPrimaryPress={() => {
          setSuccessModalVisible(false);
          navigation.navigate('Login');
        }}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  updateBtn: {
    marginTop: spacing.md,
  },
});

