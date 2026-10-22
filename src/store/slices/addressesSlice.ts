import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address } from '../../types';
import { MOCK_SAVED_ADDRESSES } from '../../data/mockData';
import { storage } from '../../utils/storage';

export interface AddressesState {
  addresses: Address[];
  selectedAddress: Address | null;
  isHydrated: boolean;
}

const initialState: AddressesState = {
  addresses: MOCK_SAVED_ADDRESSES,
  selectedAddress: MOCK_SAVED_ADDRESSES[0] || null,
  isHydrated: false,
};

export const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    hydrateAddresses: (state, action: PayloadAction<Address[]>) => {
      if (action.payload && action.payload.length > 0) {
        state.addresses = action.payload;
        const defaultAddr = action.payload.find((a) => a.isDefault) || action.payload[0];
        state.selectedAddress = defaultAddr;
      }
      state.isHydrated = true;
    },
    selectAddress: (state, action: PayloadAction<string>) => {
      const found = state.addresses.find((a) => a.id === action.payload);
      if (found) {
        state.selectedAddress = found;
      }
    },
    addAddress: (state, action: PayloadAction<Omit<Address, 'id'>>) => {
      const newId = `addr-${Date.now()}`;
      const newAddress: Address = {
        ...action.payload,
        id: newId,
      };

      if (newAddress.isDefault || state.addresses.length === 0) {
        state.addresses = state.addresses.map((a) => ({ ...a, isDefault: false }));
        newAddress.isDefault = true;
        state.selectedAddress = newAddress;
      }

      state.addresses.unshift(newAddress);
      storage.setItem(storage.KEYS.SAVED_ADDRESSES, state.addresses);
    },
    updateAddress: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === action.payload.id,
          }));
        }
        state.addresses[index] = action.payload;
        if (state.selectedAddress?.id === action.payload.id) {
          state.selectedAddress = action.payload;
        }
        storage.setItem(storage.KEYS.SAVED_ADDRESSES, state.addresses);
      }
    },
    deleteAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      if (state.selectedAddress?.id === action.payload) {
        state.selectedAddress = state.addresses[0] || null;
      }
      storage.setItem(storage.KEYS.SAVED_ADDRESSES, state.addresses);
    },
    setDefaultAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.map((a) => ({
        ...a,
        isDefault: a.id === action.payload,
      }));
      const found = state.addresses.find((a) => a.id === action.payload);
      if (found) {
        state.selectedAddress = found;
      }
      storage.setItem(storage.KEYS.SAVED_ADDRESSES, state.addresses);
    },
  },
});

export const {
  hydrateAddresses,
  selectAddress,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = addressesSlice.actions;

export default addressesSlice.reducer;

