import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { AuthStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { triggerHaptic } from '../../utils/haptics';

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
};

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      errs.phone = 'Please enter a valid Pakistani phone number';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.terms = 'Please accept the Terms of Service';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) {
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    triggerHaptic('light');

    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');

      // Create new user in state
      dispatch(
        loginUser({
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        })
      );

      // Successfully proceed to location setup
      navigation.navigate('LocationSetup', { isFromSignup: true });
    }, 600);
  };

  return (
    <AppScreen keyboardAvoiding safeBottom safeTop>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Create Account" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Join Crave</Text>
        <Text style={styles.subtitle}>
          Sign up to explore Lahore's favorite restaurants with fast doorstep delivery.
        </Text>

        <View style={styles.form}>
          <CustomTextInput
            label="Full Name"
            placeholder="e.g. Abu Huraira"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            error={errors.name}
          />

          <CustomTextInput
            label="Email Address"
            placeholder="huraira@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            error={errors.email}
          />

          <CustomTextInput
            label="Phone Number"
            placeholder="+92 300 0000000"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
            error={errors.phone}
          />

          <CustomTextInput
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            error={errors.password}
            helperText="At least 6 characters"
          />

          <CustomTextInput
            label="Confirm Password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            error={errors.confirmPassword}
          />

          {/* Terms checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            activeOpacity={0.8}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View style={[styles.checkbox, agreeTerms ? styles.checkboxActive : null]}>
              {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsHighlight}>Terms of Service</Text> and{' '}
              <Text style={styles.termsHighlight}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

          <PrimaryButton
            title="Create Account"
            onPress={handleSignup}
            variant="primary"
            size="lg"
            loading={loading}
            gradient
            style={styles.signupBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.heading,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  form: {
    marginBottom: spacing.lg,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsHighlight: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  signupBtn: {
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
});

