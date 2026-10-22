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
import { colors, typography, radii, spacing } from '../../theme';
import { AuthStackParamList, RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppDispatch } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import { triggerHaptic } from '../../utils/haptics';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const navigateToMain = () => {
    const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (parent) {
      parent.replace('MainTabs');
    } else {
      (navigation as any).replace('MainTabs');
    }
  };

  const handleLogin = () => {
    if (!validate()) {
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    triggerHaptic('light');

    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      // Create mock user
      dispatch(
        loginUser({
          id: 'user-crave-01',
          name: email.split('@')[0] || 'Crave Gourmet',
          email,
          phone: '+92 300 1234567',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        })
      );
      navigateToMain();
    }, 600);
  };

  const handleTryDemo = () => {
    triggerHaptic('selection');
    setEmail('demo.foodie@crave.pk');
    setPassword('CravePass2026!');
    setErrors({});

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerHaptic('success');
      dispatch(
        loginUser({
          id: 'user-demo-lahore',
          name: 'Ahmed Khan',
          email: 'demo.foodie@crave.pk',
          phone: '+92 321 4567890',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        })
      );
      navigateToMain();
    }, 400);
  };

  return (
    <AppScreen keyboardAvoiding safeBottom safeTop>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand visual header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="fast-food" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Log in to order from your favorite Lahore eateries.
          </Text>
        </View>

        {/* Demo Fast Login Banner */}
        <TouchableOpacity
          style={styles.demoBanner}
          activeOpacity={0.85}
          onPress={handleTryDemo}
        >
          <View style={styles.demoBannerContent}>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>FAST PASS</Text>
            </View>
            <Text style={styles.demoTitle}>Try Demo Account</Text>
            <Text style={styles.demoSubtitle}>
              One-click instant login with Ahmed Khan (Lahore foodie)
            </Text>
          </View>
          <Ionicons name="flash" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Input fields */}
        <View style={styles.formContainer}>
          <CustomTextInput
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            error={errors.email}
          />

          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Log In"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            loading={loading}
            gradient
            style={styles.loginBtn}
          />
        </View>

        {/* Signup redirection */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    elevation: 4,
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  welcomeTitle: {
    fontSize: typography.sizes.heading,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: '#FFD3BE',
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  demoBannerContent: {
    flex: 1,
  },
  demoBadge: {
    backgroundColor: colors.primaryDeep,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
    marginBottom: 4,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  demoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primaryDeep,
  },
  loginBtn: {
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
  },
});

