import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../theme';
import { AuthStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { triggerHaptic } from '../../utils/haptics';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    triggerHaptic('light');

    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      navigation.navigate('VerificationCode', {
        email: email.trim(),
        mockCode: '482910',
      });
    }, 500);
  };

  return (
    <AppScreen safeBottom safeTop keyboardAvoiding>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Reset Password" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={36} color={colors.primary} />
        </View>

        <Text style={styles.title}>Forgot Your Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email and we'll send you a demonstration recovery code.
        </Text>

        <View style={styles.demoNotice}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.demoNoticeText}>
            Demo Notice: This is a simulated flow. No real emails or SMS messages are sent.
            A test verification code will appear on the next screen.
          </Text>
        </View>

        <CustomTextInput
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          error={error}
        />

        <PrimaryButton
          title="Send Demo Code"
          onPress={handleSendCode}
          variant="primary"
          size="lg"
          loading={loading}
          gradient
          style={styles.submitBtn}
        />
      </ScrollView>
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
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: 8,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

