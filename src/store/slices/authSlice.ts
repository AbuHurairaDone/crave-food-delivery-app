import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { storage } from '../../utils/storage';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isOnboardingCompleted: false,
  isHydrated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth: (
      state,
      action: PayloadAction<{
        user: User | null;
        isOnboardingCompleted: boolean;
      }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
      state.isOnboardingCompleted = action.payload.isOnboardingCompleted;
      state.isHydrated = true;
    },
    completeOnboarding: (state) => {
      state.isOnboardingCompleted = true;
      storage.setItem(storage.KEYS.ONBOARDING_COMPLETED, true);
    },
    loginUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      storage.setItem(storage.KEYS.AUTH_USER, action.payload);
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        storage.setItem(storage.KEYS.AUTH_USER, state.user);
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      storage.removeItem(storage.KEYS.AUTH_USER);
    },
  },
});

export const {
  hydrateAuth,
  completeOnboarding,
  loginUser,
  updateProfile,
  logoutUser,
} = authSlice.actions;

export default authSlice.reducer;

