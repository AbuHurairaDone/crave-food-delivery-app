import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../theme';
import { AuthStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { triggerHaptic } from '../../utils/haptics';

type VerificationCodeProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerificationCode'>;
  route: RouteProp<AuthStackParamList, 'VerificationCode'>;
};

export const VerificationCodeScreen: React.FC<VerificationCodeProps> = ({
  navigation,
  route,
}) => {
  const { email, mockCode } = route.params;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!code.trim()) {
      setError('Please enter the 6-digit verification code');
      triggerHaptic('error');
      return;
    }

    if (code.trim() !== mockCode) {
      setError(`Invalid code. Use the demo code: ${mockCode}`);
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    triggerHaptic('light');

    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      navigation.navigate('ResetPassword', { email });
    }, 400);
  };

  const handleAutoFill = () => {
    triggerHaptic('selection');
    setCode(mockCode);
    setError('');
  };

  return (
    <AppScreen safeBottom safeTop keyboardAvoiding>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Verify Code" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={36} color={colors.primary} />
        </View>

        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We simulated a recovery email sent to <Text style={styles.emailText}>{email}</Text>
        </Text>

        {/* Demo banner with test code */}
        <View style={styles.codeBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.testBadge}>
              <Text style={styles.testBadgeText}>DEMO TEST CODE</Text>
            </View>
          </View>
          <Text style={styles.codeText}>{mockCode}</Text>
          <TouchableOpacity style={styles.autoFillBtn} onPress={handleAutoFill}>
            <Ionicons name="copy-outline" size={14} color={colors.primaryDeep} />
            <Text style={styles.autoFillText}>Tap to auto-fill code</Text>
          </TouchableOpacity>
        </View>

        <CustomTextInput
          label="6-Digit Verification Code"
          placeholder="e.g. 482910"
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (error) setError('');
          }}
          keyboardType="number-pad"
          maxLength={6}
          leftIcon={<Ionicons name="lock-open-outline" size={20} color={colors.textSecondary} />}
          error={error}
        />

        <PrimaryButton
          title="Verify Code"
          onPress={handleVerify}
          variant="primary"
          size="lg"
          loading={loading}
          gradient
          style={styles.verifyBtn}
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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emailText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  codeBanner: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: '#FFD3BE',
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  badgeRow: {
    marginBottom: 8,
  },
  testBadge: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  testBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primaryDeep,
    letterSpacing: 6,
    marginVertical: 4,
  },
  autoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 4,
  },
  autoFillText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
  verifyBtn: {
    marginTop: spacing.md,
  },
});

