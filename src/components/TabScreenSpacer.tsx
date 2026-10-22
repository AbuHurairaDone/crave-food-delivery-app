import React from 'react';
import { View } from 'react-native';
import { useTabScreenPadding } from '../hooks/useTabScreenPadding';

interface TabScreenSpacerProps {
  hasSafeBottomContainer?: boolean;
  extraBuffer?: number;
}

export const TabScreenSpacer: React.FC<TabScreenSpacerProps> = ({
  hasSafeBottomContainer = false,
  extraBuffer,
}) => {
  const bottomHeight = useTabScreenPadding(hasSafeBottomContainer, extraBuffer);
  return <View style={{ height: bottomHeight }} />;
};

