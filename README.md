# Crave — Multi-Restaurant Food Delivery Mobile App 🍔🍕

**Crave** is a visually polished, frontend-only food delivery mobile app built with **React Native**, **Expo SDK 58**, and **TypeScript**, showcasing the vibrant culinary scene of Lahore, Pakistan.

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Verification Commands
```bash
# Typecheck
npx tsc --noEmit

# Linting
npx expo lint

# Dependency and Expo SDK diagnostics
npx expo-doctor
```

---

## 📱 Demonstration Credentials & Shortcuts

### Demo Login
- **Email:** `demo.foodie@crave.pk`
- **Password:** `CravePass2026!`
- **Fast Pass:** On the login screen, tap the prominent **"Try Demo Account"** card to instantly authenticate with a pre-configured Lahore foodie account (*Ahmed Khan*).

### Demo Password Reset
- **Recovery Email:** Any valid email (e.g. `test@crave.pk`)
- **Demo Verification Code:** `482910` (displayed with a one-tap auto-fill button)

### Demo Promo Codes
| Code | Discount | Minimum Order | Cap / Rules |
| :--- | :--- | :--- | :--- |
| **`CRAVE10`** | 10% OFF | PKR 800 | Max discount PKR 350. |
| **`WELCOME50`** | 15% OFF | PKR 500 | Max discount PKR 250 for new cravers. |
| **`FEAST20`** | 20% OFF | PKR 2,000 | Max discount PKR 600 for family platters. |

---

## 🧭 Complete User Journey Verified

1. **Splash:** Animated brand reveal, logo pulse, and background state restoration from AsyncStorage.
2. **Onboarding:** 3 interactive food slides with animated pagination indicators, skip, and Get Started.
3. **Authentication:**
   - Login with email validation, password visibility toggle, and instant demo login button.
   - Signup with name, email, phone, password guidance, and terms agreement.
   - Simulated Forgot Password flow with test code `482910` and password reset.
4. **Location Setup:**
   - Optional device GPS request using `expo-location` with graceful denial fallback.
   - Preset Lahore neighborhoods (*MM Alam Road, DHA Phase 5, Model Town, Johar Town*).
   - Manual address entry modal working offline without permissions.
5. **Home & Discovery:**
   - Real-time delivery address header with location picker.
   - Personalized time-of-day greeting.
   - Promotional carousel banners with deal badges.
   - Horizontal category chips (*Burgers, Pizza, Desi Food, Fast Food, Desserts, Beverages, Asian*).
   - Signature dishes and popular restaurants with ratings and review counts.
6. **Search & Explore:**
   - Search dishes, cuisines, and restaurants with instant local filtering.
   - Filter bottom sheet (Price range `$`, `$$`, `$$$`; Ratings `4.0+`, `4.5+`, `4.8+`; Max delivery time `25`, `35`, `45` mins).
   - Dynamic sorting: Most Popular, Highest Rated, Fastest Delivery, and Price Low to High.
7. **Restaurant & Food Details:**
   - Restaurant hero image, rating badge, fee, and menu category pills.
   - Dish customization: size/variant selection, optional add-ons, special instructions, and live price updates.
8. **Cart Management:**
   - Single-restaurant cart enforcement with custom conflict replacement modal.
   - Merging identical items and custom options.
   - Promo code validation with live calculations.
   - Custom item deletion confirmation and empty state.
9. **Checkout & Order Placement:**
   - Address selection, delivery note instructions, and payment method selector (*Cash on Delivery* and *Simulated Demo Card*).
   - Double-tap order prevention and price recalculation.
10. **Order Confirmation & Tracking:**
    - Animated celebration with generated mock order number (e.g. `CRV-89421`).
    - Simulated live order timeline (*Confirmed ➔ Preparing ➔ Picked Up ➔ On The Way ➔ Delivered*).
    - Demo control to manually advance order status.
    - Simulated rider card with interactive demo call and chat buttons.
11. **My Orders & Profile:**
    - Active and past orders tabs with reorder capability.
    - Saved addresses manager (*Home, Work, Other* with default toggles).
    - Favorites manager for dishes and restaurants.
    - Notification preferences and demo help/support accordion.

---

## 📂 Project Architecture

```
src/
├── components/          # Reusable UI widgets
│   ├── AddressCard.tsx
│   ├── AppScreen.tsx
│   ├── CartItemCard.tsx
│   ├── CategoryChip.tsx
│   ├── CustomBottomSheet.tsx
│   ├── CustomHeader.tsx
│   ├── CustomModal.tsx
│   ├── CustomTabBar.tsx
│   ├── CustomTextInput.tsx
│   ├── CustomToast.tsx
│   ├── EmptyState.tsx
│   ├── FavoriteButton.tsx
│   ├── FoodCard.tsx
│   ├── IconButton.tsx
│   ├── LocationHeader.tsx
│   ├── OrderStatusTimeline.tsx
│   ├── PriceSummary.tsx
│   ├── PrimaryButton.tsx
│   ├── QuantityStepper.tsx
│   ├── RatingBadge.tsx
│   ├── RestaurantCard.tsx
│   ├── SearchBar.tsx
│   └── SkeletonLoader.tsx
├── data/
│   └── mockData.ts      # 8 restaurants, 30+ food items, Lahore presets, promo codes
├── navigation/
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── RootNavigator.tsx
├── screens/
│   ├── address/         # SavedAddressesScreen, AddEditAddressScreen
│   ├── auth/            # LoginScreen, SignupScreen, ForgotPassword, Verification, Reset, LocationSetup
│   ├── cart/            # CartScreen
│   ├── checkout/        # CheckoutScreen
│   ├── explore/         # ExploreScreen
│   ├── food/            # FoodDetailsScreen
│   ├── home/            # HomeScreen
│   ├── onboarding/      # OnboardingScreen
│   ├── orders/          # OrdersScreen, OrderConfirmationScreen, OrderTrackingScreen
│   ├── profile/         # ProfileScreen, EditProfileScreen, FavoritesScreen, NotificationsScreen, HelpSupportScreen
│   └── splash/          # SplashScreen
├── store/
│   ├── slices/          # authSlice, cartSlice, restaurantsSlice, ordersSlice, addressesSlice
│   └── index.ts         # Redux store configuration and typed hooks
├── theme/
│   ├── colors.ts        # Primary orange (#FF6B35), cream (#FFF9F3), deep orange, etc.
│   ├── typography.ts    # Font sizes, line heights, and 8-pt spacing
│   └── index.ts
├── types/
│   ├── index.ts         # Restaurant, FoodItem, CartItem, Order, Address, PromoCode
│   └── navigation.ts    # RootStack, AuthStack, MainTab param lists
└── utils/
    ├── haptics.ts       # Cross-platform haptic feedback helper
    └── storage.ts       # AsyncStorage persistence wrapper
```

---

## 🖥️ How to Preview the App

### Option A: Mobile Device via Expo Go (Recommended)
1. Install **Expo Go** from Google Play Store (Android) or App Store (iOS).
2. In your terminal, run:
   ```bash
   npx expo start
   ```
3. Scan the generated QR code with your mobile camera (iOS) or the Expo Go app (Android).

### Option B: Local Web Browser
1. In your terminal, run:
   ```bash
   npx expo start --web
   ```
2. Press `w` or open `http://localhost:8081` in your browser. (Tip: Open Developer Tools and toggle the Mobile Device toolbar for the best mobile phone viewport).

### Option C: Android Emulator
1. Start an Android Virtual Device (AVD) via Android Studio.
2. In your terminal, run:
   ```bash
   npx expo start --android
   ```

---

## 🛠️ Diagnostics & Verification Report

- **Android Hermes Bytecode Native Bundling (`npx expo export --platform android`):** ✅ Passed cleanly (1552 modules, 4.2MB bundle).
- **Web Runtime Bundling (`npx expo export --platform web`):** ✅ Passed cleanly (1221 modules, 2.7MB bundle).
- **TypeScript (`npx tsc --noEmit`):** ✅ Passed with 0 errors.
- **ESLint (`npx expo lint`):** ✅ Passed with 0 errors.
- **Expo Doctor (`npx expo-doctor`):** ✅ 20/20 checks passed with 0 issues.
- **Automated Journey Verification (`tsx verify_flow.ts`):** ✅ All 12 user journeys verified.
- **Device Testing Status:** No physical Android device was connected via ADB and no Android Virtual Device was running on this Windows host. Automated bundling and journey verification were completed headlessly.

