import React, { useLayoutEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useTheme, Appbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation'; // adjust path
import { commonStyles } from '../styles/common';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation';
import { useNavigation } from '@react-navigation/native';

// Define type for navigation props
// type Props = NativeStackScreenProps<RootStackParamList, 'WebViewScreen'>;
type WebViewProp = DrawerNavigationProp<RootDrawerParamList, 'WebViewScreen'>;

const WebViewScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<WebViewProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          {/* Hamburger menu icon */}
          <Appbar.Action
            icon="menu"
            color={theme.colors.onPrimary}
            onPress={() => navigation.toggleDrawer()}
          />
          <Appbar.Content
            title="Dummy Screen"
            titleStyle={{ color: theme.colors.onPrimary }}
          />
        </Appbar.Header>
      ),
    });
  }, [navigation, theme]);

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: theme.colors.surface }]}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, color: theme.colors.onSurface }}>
            This is a dummy screen with a back button in the header.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WebViewScreen;
