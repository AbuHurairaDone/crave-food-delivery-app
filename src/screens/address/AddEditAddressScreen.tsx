import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomTextInput } from '../../components/CustomTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppDispatch } from '../../store';
import { addAddress, updateAddress } from '../../store/slices/addressesSlice';
import { AddressType } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type AddEditAddressRouteProp = RouteProp<RootStackParamList, 'AddEditAddress'>;

export const AddEditAddressScreen: React.FC<{
  route: AddEditAddressRouteProp;
}> = ({ route }) => {
  const { addressId, initialAddress } = route.params || {};
  const isEditing = Boolean(addressId && initialAddress);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const [label, setLabel] = useState<AddressType>(initialAddress?.label || 'Home');
  const [title, setTitle] = useState(initialAddress?.title || '');
  const [street, setStreet] = useState(initialAddress?.street || '');
  const [area, setArea] = useState(initialAddress?.area || 'Gulberg III');
  const [city, setCity] = useState(initialAddress?.city || 'Lahore');
  const [note, setNote] = useState(initialAddress?.note || '');
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required (e.g. My Flat, Office)';
    if (!street.trim()) errs.street = 'Street address is required';
    if (!area.trim()) errs.area = 'Area is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    if (isEditing && addressId) {
      dispatch(
        updateAddress({
          id: addressId,
          label,
          title: title.trim(),
          street: street.trim(),
          area: area.trim(),
          city: city.trim(),
          note: note.trim() || undefined,
          isDefault,
        })
      );
    } else {
      dispatch(
        addAddress({
          label,
          title: title.trim(),
          street: street.trim(),
          area: area.trim(),
          city: city.trim(),
          note: note.trim() || undefined,
          isDefault,
        })
      );
    }

    navigation.goBack();
  };

  return (
    <AppScreen safeTop safeBottom scrollable keyboardAvoiding contentContainerStyle={styles.scrollContent}>
      <CustomHeader
        showBack
        onBack={() => navigation.goBack()}
        title={isEditing ? 'Edit Address' : 'Add New Address'}
      />

      <View style={styles.formContainer}>
        {/* Label Selector */}
        <Text style={styles.labelSectionTitle}>Address Type</Text>
        <View style={styles.labelRow}>
          {(['Home', 'Work', 'Other'] as const).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.labelPill, label === l ? styles.labelPillActive : null]}
              onPress={() => {
                triggerHaptic('selection');
                setLabel(l);
              }}
            >
              <Ionicons
                name={l === 'Home' ? 'home' : l === 'Work' ? 'briefcase' : 'location'}
                size={16}
                color={label === l ? '#FFFFFF' : colors.textPrimary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.labelPillText, label === l ? styles.labelPillTextActive : null]}>
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomTextInput
          label="Address Title"
          placeholder="e.g. My Apartment, Mom's House"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          error={errors.title}
        />

        <CustomTextInput
          label="Street Address / House No."
          placeholder="e.g. House 42-B, Street 7, Block B-3"
          value={street}
          onChangeText={(text) => {
            setStreet(text);
            if (errors.street) setErrors((prev) => ({ ...prev, street: '' }));
          }}
          error={errors.street}
        />

        <CustomTextInput
          label="Area / Neighborhood"
          placeholder="e.g. Gulberg III, DHA Phase 5, Model Town"
          value={area}
          onChangeText={(text) => {
            setArea(text);
            if (errors.area) setErrors((prev) => ({ ...prev, area: '' }));
          }}
          error={errors.area}
        />

        <CustomTextInput
          label="City"
          placeholder="e.g. Lahore"
          value={city}
          onChangeText={setCity}
        />

        <CustomTextInput
          label="Delivery Note (Optional)"
          placeholder="e.g. Gate bell is on the left, please don't honk"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Set as Default Address</Text>
            <Text style={styles.switchSubtitle}>Use this address automatically for all new orders</Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setIsDefault(val);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <PrimaryButton
          title={isEditing ? 'Update Address' : 'Save Address'}
          onPress={handleSave}
          variant="primary"
          size="lg"
          gradient
          style={{ marginTop: spacing.md }}
        />
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  formContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  labelSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  labelPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  labelPillText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  switchTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  switchSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

