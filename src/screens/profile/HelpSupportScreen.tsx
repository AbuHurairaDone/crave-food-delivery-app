import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, spacing, shadows } from '../../theme';
import { RootStackParamList } from '../../types/navigation';
import { AppScreen } from '../../components/AppScreen';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomToast } from '../../components/CustomToast';
import { triggerHaptic } from '../../utils/haptics';

type HelpSupportProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HelpSupport'>;
};

const FAQS = [
  {
    q: 'How does food delivery work on Crave?',
    a: 'Choose your desired restaurant in Lahore, customize items to your preference, add to cart, and checkout with Cash on Delivery or Demo Card. Your rider will deliver within 25-45 minutes.',
  },
  {
    q: 'Can I order from multiple restaurants in a single order?',
    a: 'To guarantee freshness and speedy delivery, orders are limited to one restaurant at a time. If you add items from a different restaurant, you can choose to replace your current cart.',
  },
  {
    q: 'What promo codes are available for demo?',
    a: 'You can test "CRAVE10" for 10% off (min order PKR 800), "WELCOME50" for 15% off (min order PKR 500), and "FEAST20" for 20% off (min order PKR 2000).',
  },
  {
    q: 'Which areas in Lahore are covered?',
    a: 'We cover all major Lahore zones including Gulberg, DHA Phases 1-6, Model Town, Johar Town, Cantt, Allama Iqbal Town, and the Walled City.',
  },
];

export const HelpSupportScreen: React.FC<HelpSupportProps> = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleAccordion = (index: number) => {
    triggerHaptic('light');
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactAction = (type: 'call' | 'chat' | 'email') => {
    triggerHaptic('light');
    if (type === 'call') {
      setToastMessage('Simulated Support Call: Connecting to Crave Care (042-111-272-837)...');
    } else if (type === 'chat') {
      setToastMessage('Simulated Live Support Chat: Agent Ayesha is ready to help you!');
    } else {
      setToastMessage('Simulated Support Ticket: Inquiry logged to support@crave.pk.');
    }
  };

  return (
    <AppScreen safeTop safeBottom scrollable contentContainerStyle={styles.scrollContent}>
      <CustomHeader showBack onBack={() => navigation.goBack()} title="Help & Support" />

      {/* Contact Support Cards */}
      <View style={styles.contactRow}>
        <TouchableOpacity
          style={[styles.contactCard, shadows.sm]}
          onPress={() => handleContactAction('chat')}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="chatbubbles-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.contactTitle}>Live Chat</Text>
          <Text style={styles.contactSub}>Demo agent 24/7</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, shadows.sm]}
          onPress={() => handleContactAction('call')}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: '#EAF7EE' }]}>
            <Ionicons name="call-outline" size={22} color={colors.success} />
          </View>
          <Text style={styles.contactTitle}>Call Us</Text>
          <Text style={styles.contactSub}>Demo hotline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactCard, shadows.sm]}
          onPress={() => handleContactAction('email')}
        >
          <View style={[styles.contactIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="mail-outline" size={22} color="#D97706" />
          </View>
          <Text style={styles.contactTitle}>Email</Text>
          <Text style={styles.contactSub}>Fast response</Text>
        </TouchableOpacity>
      </View>

      {/* Frequently Asked Questions */}
      <View style={styles.faqSection}>
        <Text style={styles.faqHeading}>Frequently Asked Questions</Text>

        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.faqCard, shadows.sm]}
              activeOpacity={0.85}
              onPress={() => toggleAccordion(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.questionText}>{faq.q}</Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
              {isExpanded && <Text style={styles.answerText}>{faq.a}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomToast
        visible={!!toastMessage}
        message={toastMessage || ''}
        type="info"
        onHide={() => setToastMessage(null)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  contactCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  contactTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contactSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  faqSection: {
    marginTop: spacing.md,
  },
  faqHeading: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  answerText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

