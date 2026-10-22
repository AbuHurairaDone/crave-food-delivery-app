import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  RefreshControl,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { colors } from '../theme';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  safeBottom?: boolean;
  safeTop?: boolean;
  backgroundColor?: string;
  statusBarColor?: string;
  statusBarStyle?: StatusBarStyle;
  showStatusBarFill?: boolean;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  keyboardAvoiding = false,
  refreshing = false,
  onRefresh,
  safeBottom = true,
  safeTop = true,
  backgroundColor = colors.background,
  statusBarColor = colors.primary,
  statusBarStyle = 'light',
  showStatusBarFill,
}) => {
  const insets = useSafeAreaInsets();
  const shouldFillStatusBar = showStatusBarFill ?? safeTop;

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setBackgroundColor(statusBarColor, true);
      RNStatusBar.setTranslucent(!safeTop);
    }
  }, [statusBarColor, safeTop]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: safeTop && !shouldFillStatusBar ? insets.top : 0,
    paddingBottom: safeBottom ? insets.bottom : 0,
  };

  const content = scrollable ? (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, style]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style={statusBarStyle} />
      {shouldFillStatusBar && insets.top > 0 ? (
        <View
          style={[
            styles.statusBarFill,
            { height: insets.top, backgroundColor: statusBarColor },
          ]}
        />
      ) : null}
      <View style={containerStyle}>
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  statusBarFill: {
    width: '100%',
    zIndex: 999,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

