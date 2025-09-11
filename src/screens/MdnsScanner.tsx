import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import HyperhdrScannerContent from '../components/HyperhdrScannerContent';

// Paper components
import { Appbar, useTheme, Surface } from 'react-native-paper';

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MdnsScanner'
>;

export default function MdnsScanner() {
  const navigation = useNavigation<MdnsScannerNavigationProp>();
  const theme = useTheme(); // get current Paper theme (light/dark)

  const handleOpen = () => {
    navigation.replace('MainDashBoard');
  };

  return (
    <Surface style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Paper Appbar */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content
          title="My Devices"
          titleStyle={{ color: theme.colors.onPrimary }}
        />
        <Appbar.Action
          icon="plus"
          color={theme.colors.onPrimary} // icon color
          onPress={() => navigation.navigate('BleScanner')}
        />
      </Appbar.Header>

      {/* Content area */}
      {/* <HyperhdrScannerContent onConnect={handleOpen} /> */}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
});
