import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomToast } from '../../components/CustomToast';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import { triggerHaptic } from '../../utils/haptics';

type EditProfileProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
];

export const EditProfileScreen: React.FC<EditProfileProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_PRESETS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    dispatch(
      updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl,
      })
    );

    setToastMessage('Profile updated successfully!');
    setTimeout(() => {
      navigation.goBack();
    }, 600);
  };

  return (
    <AppScreen safeTop safeBottom scrollable keyboardAvoiding contentContainerStyle={styles.scrollContent}>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Edit Profile" />

      {/* Avatar Picker */}
      <View style={styles.avatarSection}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
        <Text style={styles.selectAvatarLabel}>Choose Demo Avatar:</Text>
        <View style={styles.avatarRow}>
          {AVATAR_PRESETS.map((url, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                triggerHaptic('selection');
                setAvatarUrl(url);
              }}
              style={[
                styles.avatarOption,
                avatarUrl === url ? styles.avatarOptionSelected : null,
              ]}
            >
              <Image source={{ uri: url }} style={styles.avatarThumb} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fields */}
      <View style={styles.form}>
        <CustomTextInput
          label="Full Name"
          placeholder="Your full name"
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
          placeholder="your.email@example.com"
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
          placeholder="+92 300 1234567"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
          }}
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
          error={errors.phone}
        />

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          size="lg"
          gradient
          style={{ marginTop: spacing.md }}
        />
      </View>

      <CustomToast
        visible={!!toastMessage}
        message={toastMessage || ''}
        type="success"
        onHide={() => setToastMessage(null)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EBE2D8',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectAvatarLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarOptionSelected: {
    borderColor: colors.primaryDeep,
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
  },
  form: {
    marginTop: spacing.sm,
  },
});

