import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { AddressCard } from '../../components/AddressCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { EmptyState } from '../../components/EmptyState';
import { CustomModal } from '../../components/CustomModal';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectAddress, deleteAddress } from '../../store/slices/addressesSlice';
import { triggerHaptic } from '../../utils/haptics';

type SavedAddressesRouteProp = RouteProp<RootStackParamList, 'SavedAddresses'>;

export const SavedAddressesScreen: React.FC<{
  route: SavedAddressesRouteProp;
}> = ({ route }) => {
  const selectMode = route.params?.selectMode;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const { addresses, selectedAddress } = useAppSelector((s) => s.addresses);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    triggerHaptic('selection');
    dispatch(selectAddress(id));
    if (selectMode) {
      navigation.goBack();
    }
  };

  const handleDeleteConfirm = () => {
    if (addressToDelete) {
      triggerHaptic('warning');
      dispatch(deleteAddress(addressToDelete));
      setAddressToDelete(null);
    }
  };

  return (
    <AppScreen safeTop safeBottom scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader
        showBack
        onBack={() => navigation.goBack()}
        title={selectMode ? 'Choose Delivery Location' : 'Saved Addresses'}
      />

      <View style={styles.container}>
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress?.id === address.id}
              onSelect={() => handleSelect(address.id)}
              onEdit={() =>
                navigation.navigate('AddEditAddress', {
                  addressId: address.id,
                  initialAddress: address,
                })
              }
              onDelete={() => setAddressToDelete(address.id)}
            />
          ))
        ) : (
          <EmptyState
            iconName="location-outline"
            title="No Saved Addresses"
            description="You don't have any saved delivery addresses yet. Add one below!"
          />
        )}

        <PrimaryButton
          title="Add New Address"
          onPress={() => navigation.navigate('AddEditAddress', { isNew: true })}
          variant="primary"
          size="lg"
          gradient
          leftIcon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          style={{ marginTop: spacing.md }}
        />
      </View>

      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        iconName="trash-outline"
        iconColor={colors.error}
        iconBgColor={colors.errorSoft}
        title="Delete Address?"
        description="Are you sure you want to remove this address from your saved locations?"
        primaryButtonTitle="Delete"
        primaryButtonVariant="danger"
        onPrimaryPress={handleDeleteConfirm}
        secondaryButtonTitle="Cancel"
        onSecondaryPress={() => setAddressToDelete(null)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});

