import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CustomTextInput } from '../../components/CustomTextInput';
import { CustomBottomSheet } from '../../components/CustomBottomSheet';
import { useAppDispatch } from '../../store';
import { addAddress } from '../../store/slices/addressesSlice';
import { Address } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

type LocationSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const LAHORE_PRESETS = [
  {
    title: 'MM Alam Road, Gulberg III',
    street: 'Building 14, Main Boulevard',
    area: 'Gulberg III',
    city: 'Lahore',
    label: 'Home' as const,
  },
  {
    title: 'CCA Sector C, DHA Phase 5',
    street: 'Plaza 89, Commercial Area',
    area: 'DHA Phase 5',
    city: 'Lahore',
    label: 'Work' as const,
  },
  {
    title: 'Model Town Link Road',
    street: 'Street 12, Block C',
    area: 'Model Town',
    city: 'Lahore',
    label: 'Other' as const,
  },
  {
    title: 'Civic Centre, Johar Town',
    street: 'Near Emporium Mall Avenue',
    area: 'Johar Town',
    city: 'Lahore',
    label: 'Other' as const,
  },
];

export const LocationSetupScreen: React.FC<LocationSetupScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [permissionStatusMsg, setPermissionStatusMsg] = useState<string | null>(null);
  const [manualSheetVisible, setManualSheetVisible] = useState(false);

  // Manual entry form
  const [manualTitle, setManualTitle] = useState('');
  const [manualStreet, setManualStreet] = useState('');
  const [manualArea, setManualArea] = useState('Gulberg, Lahore');
  const [manualLabel, setManualLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  const navigateToMain = () => {
    const parent = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    if (parent) {
      parent.replace('MainTabs');
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleUseCurrentLocation = async () => {
    triggerHaptic('light');
    setLoadingLocation(true);
    setPermissionStatusMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatusMsg(
          'Location access was denied. You can choose any Lahore address preset or enter your address manually below.'
        );
        triggerHaptic('warning');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Retrieved coordinates without faking verified street address
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      const detectedAddr: Omit<Address, 'id'> = {
        label: 'Home',
        title: 'Current Location (GPS)',
        street: `GPS Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        area: 'Lahore Central',
        city: 'Lahore',
        isDefault: true,
        latitude: lat,
        longitude: lng,
        note: 'Address confirmed via device location',
      };

      dispatch(addAddress(detectedAddr));
      triggerHaptic('success');
      setPermissionStatusMsg(`Location found (${lat.toFixed(3)}, ${lng.toFixed(3)})! Ready to deliver.`);
      setTimeout(() => {
        navigateToMain();
      }, 700);
    } catch {
      setPermissionStatusMsg(
        'Could not retrieve GPS coordinates. Please pick one of the demo Lahore locations below.'
      );
      triggerHaptic('error');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSelectPreset = (preset: typeof LAHORE_PRESETS[0]) => {
    triggerHaptic('selection');
    dispatch(
      addAddress({
        label: preset.label,
        title: preset.title,
        street: preset.street,
        area: preset.area,
        city: preset.city,
        isDefault: true,
      })
    );
    navigateToMain();
  };

  const handleSaveManualAddress = () => {
    if (!manualStreet.trim() || !manualTitle.trim()) {
      triggerHaptic('error');
      return;
    }

    triggerHaptic('success');
    dispatch(
      addAddress({
        label: manualLabel,
        title: manualTitle.trim(),
        street: manualStreet.trim(),
        area: manualArea.trim(),
        city: 'Lahore',
        isDefault: true,
      })
    );
    setManualSheetVisible(false);
    navigateToMain();
  };

  return (
    <AppScreen safeBottom safeTop>
      <CustomHeader
        showBack={false}
        title="Delivery Address"
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.replace('MainTabs')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipBtn}>Skip</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="location-sharp" size={38} color={colors.primary} />
        </View>

        <Text style={styles.title}>Where should we deliver?</Text>
        <Text style={styles.subtitle}>
          Set your delivery location to view available restaurants, delivery fees, and estimated times in Lahore.
        </Text>

        {/* GPS Location Button */}
        <PrimaryButton
          title={loadingLocation ? 'Locating...' : 'Use Current Location'}
          onPress={handleUseCurrentLocation}
          variant="primary"
          size="lg"
          loading={loadingLocation}
          gradient
          leftIcon={<Ionicons name="navigate-outline" size={20} color="#FFFFFF" />}
          style={styles.gpsBtn}
        />

        {permissionStatusMsg && (
          <View style={styles.statusBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primaryDeep} />
            <Text style={styles.statusText}>{permissionStatusMsg}</Text>
          </View>
        )}

        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CHOOSE DEMO LAHORE AREA</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Lahore Presets */}
        <View style={styles.presetsList}>
          {LAHORE_PRESETS.map((preset, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.presetCard, shadows.sm]}
              activeOpacity={0.78}
              onPress={() => handleSelectPreset(preset)}
            >
              <View style={styles.presetIconCircle}>
                <Ionicons name="business-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.presetText}>
                <Text style={styles.presetTitle}>{preset.title}</Text>
                <Text style={styles.presetSubtitle}>
                  {preset.street}, {preset.city}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Manual Address Button */}
        <PrimaryButton
          title="Enter Address Manually"
          onPress={() => setManualSheetVisible(true)}
          variant="outline"
          size="md"
          leftIcon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
          style={styles.manualBtn}
        />
      </ScrollView>

      {/* Manual Address Bottom Sheet */}
      <CustomBottomSheet
        visible={manualSheetVisible}
        onClose={() => setManualSheetVisible(false)}
        title="Enter Delivery Address"
        subtitle="Works offline without location permissions"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.labelPicker}>
            {(['Home', 'Work', 'Other'] as const).map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.labelPill,
                  manualLabel === l ? styles.labelPillActive : null,
                ]}
                onPress={() => setManualLabel(l)}
              >
                <Text
                  style={[
                    styles.labelPillText,
                    manualLabel === l ? styles.labelPillTextActive : null,
                  ]}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <CustomTextInput
            label="Address Title"
            placeholder="e.g. My Apartment, Studio 4"
            value={manualTitle}
            onChangeText={setManualTitle}
          />

          <CustomTextInput
            label="Street Address / House No."
            placeholder="e.g. House 14, Street 5"
            value={manualStreet}
            onChangeText={setManualStreet}
          />

          <CustomTextInput
            label="Area & City"
            placeholder="e.g. Gulberg III, Lahore"
            value={manualArea}
            onChangeText={setManualArea}
          />

          <PrimaryButton
            title="Save & Proceed"
            onPress={handleSaveManualAddress}
            variant="primary"
            size="lg"
            gradient
            disabled={!manualTitle.trim() || !manualStreet.trim()}
            style={{ marginVertical: spacing.md }}
          />
        </ScrollView>
      </CustomBottomSheet>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  skipBtn: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.primaryDeep,
    paddingRight: 4,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
    paddingHorizontal: spacing.sm,
  },
  gpsBtn: {
    marginBottom: spacing.md,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: 8,
  },
  statusText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  presetsList: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  presetText: {
    flex: 1,
  },
  presetTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manualBtn: {
    marginTop: spacing.xs,
  },
  labelPicker: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  labelPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
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
    color: colors.textSecondary,
  },
  labelPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

