import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomModal } from '../../components/CustomModal';
import { TabScreenSpacer } from '../../components/TabScreenSpacer';
import { useAppDispatch, useAppSelector } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { triggerHaptic } from '../../utils/haptics';

type ProfileScreenNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ProfileTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavProp>();
  const dispatch = useAppDispatch();

  const user = useAppSelector((s) => s.auth.user);
  const favoriteRestaurantIds = useAppSelector(
    (s) => s.restaurants.favoriteRestaurantIds
  );
  const favoriteFoodIds = useAppSelector((s) => s.restaurants.favoriteFoodIds);
  const totalFavoritesCount = favoriteRestaurantIds.length + favoriteFoodIds.length;

  const [pushNotifications, setPushNotifications] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const handleLogout = () => {
    triggerHaptic('warning');
    dispatch(logoutUser());
    setLogoutModalVisible(false);
    navigation.replace('Auth');
  };

  return (
    <AppScreen safeTop safeBottom={false} scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader showBack={false} title="My Profile" />

      {/* User Info Header Card */}
      <View style={[styles.profileCard, shadows.sm]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.editAvatarPill}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Ahmed Khan'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'ahmed.foodie@crave.pk'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+92 321 4567890'}</Text>
        </View>

        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Account Settings Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionHeader}>Account & Preferences</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SavedAddresses')}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.menuItemText}>Saved Addresses</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="heart-outline" size={20} color={colors.primaryDeep} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.menuItemText}>My Favorites</Text>
            {totalFavoritesCount > 0 && (
              <View style={styles.favBadge}>
                <Text style={styles.favBadgeText}>{totalFavoritesCount}</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
          </View>
          <Text style={styles.menuItemText}>Notifications Inbox</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Notification Preferences */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionHeader}>Alert Settings</Text>

        <View style={styles.menuItemToggle}>
          <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="phone-portrait-outline" size={20} color={colors.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuItemText}>Order Status Push</Text>
            <Text style={styles.toggleSub}>Receive live delivery updates</Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setPushNotifications(val);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.menuItemToggle}>
          <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="gift-outline" size={20} color={colors.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuItemText}>Special Offers & Deals</Text>
            <Text style={styles.toggleSub}>Discounts from local kitchens</Text>
          </View>
          <Switch
            value={promoAlerts}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setPromoAlerts(val);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Support & About */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionHeader}>Information</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('HelpSupport')}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#EAF7EE' }]}>
            <Ionicons name="help-buoy-outline" size={20} color={colors.success} />
          </View>
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setAboutModalVisible(true)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textPrimary} />
          </View>
          <Text style={styles.menuItemText}>About Crave</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setLogoutModalVisible(true)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </View>
          <Text style={[styles.menuItemText, { color: colors.error }]}>Log Out</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Crave v1.0.0 (Client Demo Build)</Text>

      <TabScreenSpacer />

      {/* Logout Modal */}
      <CustomModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        iconName="log-out-outline"
        iconColor={colors.error}
        iconBgColor={colors.errorSoft}
        title="Confirm Logout"
        description="Are you sure you want to log out of Crave? Your saved addresses and order history will remain preserved."
        primaryButtonTitle="Log Out"
        primaryButtonVariant="danger"
        onPrimaryPress={handleLogout}
        secondaryButtonTitle="Cancel"
        onSecondaryPress={() => setLogoutModalVisible(false)}
      />

      {/* About Modal */}
      <CustomModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        iconName="restaurant"
        iconColor={colors.primary}
        iconBgColor={colors.primarySoft}
        title="About Crave"
        description="Crave is a multi-restaurant food delivery app built for Lahore culinary enthusiasts. Powered by React Native, Expo, and TypeScript."
        primaryButtonTitle="Awesome!"
        onPrimaryPress={() => setAboutModalVisible(false)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBE2D8',
  },
  editAvatarPill: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  editProfileBtn: {
    padding: 8,
  },
  menuSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  menuItemToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  favBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    marginLeft: 8,
  },
  favBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});

