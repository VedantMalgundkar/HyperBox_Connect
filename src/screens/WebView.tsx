import React, { useLayoutEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useTheme, Appbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation'; // adjust path
import { commonStyles } from '../styles/common';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation';
import { useNavigation } from '@react-navigation/native';
import WebViewComponent from '../components/WebViewComponent';

// Define type for navigation props
// type Props = NativeStackScreenProps<RootStackParamList, 'WebViewScreen'>;
type WebViewProp = DrawerNavigationProp<RootDrawerParamList, 'WebViewScreen'>;

export default function WebViewScreen() {
  const theme = useTheme();
  const navigation = useNavigation<WebViewProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.Action
            icon="menu"
            color={theme.colors.onPrimary}
            onPress={() => navigation.toggleDrawer()}
          />
          <Appbar.Content
            title="HyperHDR Panel"
            titleStyle={{ color: theme.colors.onPrimary }}
          />
        </Appbar.Header>
      ),
    });
  }, [navigation, theme]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <WebViewComponent />
    </SafeAreaView>
  );
};