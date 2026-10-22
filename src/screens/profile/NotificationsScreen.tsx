import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { EmptyState } from '../../components/EmptyState';
import { triggerHaptic } from '../../utils/haptics';

type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Order Delivered! 🎉',
    message: 'Your order CRV-89421 from The Burger Cartel was safely delivered.',
    time: '25 mins ago',
    isRead: false,
    type: 'order',
  },
  {
    id: 'notif-2',
    title: 'Special Weekend Treat: 20% OFF',
    message: 'Use demo code CRAVE10 on all orders above PKR 800 this weekend.',
    time: '2 hours ago',
    isRead: false,
    type: 'promo',
  },
  {
    id: 'notif-3',
    title: 'Welcome to Crave Lahore! 🍔',
    message: 'Explore top restaurants from MM Alam Road, DHA, and Old Lahore.',
    time: 'Yesterday',
    isRead: true,
    type: 'system',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    triggerHaptic('light');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <AppScreen safeTop safeBottom scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader
        showBack
        onBack={() => navigation.goBack()}
        title="Notifications"
        rightAction={
          notifications.some((n) => !n.isRead) ? (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markReadText}>Read all</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.container}>
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const iconName =
              notif.type === 'order'
                ? 'receipt-outline'
                : notif.type === 'promo'
                ? 'gift-outline'
                : 'sparkles-outline';

            return (
              <View
                key={notif.id}
                style={[
                  styles.notifCard,
                  shadows.sm,
                  !notif.isRead ? styles.notifUnread : null,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        notif.type === 'order'
                          ? colors.primarySoft
                          : notif.type === 'promo'
                          ? '#FEF3C7'
                          : '#EAF7EE',
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={
                      notif.type === 'order'
                        ? colors.primary
                        : notif.type === 'promo'
                        ? '#D97706'
                        : colors.success
                    }
                  />
                </View>

                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{notif.title}</Text>
                    {!notif.isRead && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.message}>{notif.message}</Text>
                  <Text style={styles.time}>{notif.time}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            iconName="notifications-off-outline"
            title="No Notifications"
            description="You are all caught up! New offers and updates will appear here."
          />
        )}
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  markReadText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.primaryDeep,
    paddingRight: 4,
  },
  container: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  notifUnread: {
    borderColor: '#FFD3BE',
    backgroundColor: '#FFFAF6',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  message: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
});

