import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MdnsScanner from '../screens/MdnsScanner';
import WifiScanner from '../screens/WifiScanner';
import BLEScanner from '../screens/BleScannerScreen';
import AppDrawer from './CustomDrawerContent';

// Stack param list
export type RootStackParamList = {
  MdnsScanner: undefined;
  AppDrawer: undefined; // Drawer is a nested navigator
  WifiScanner: { deviceId: string; isBluetoothConnected: boolean };
  BleScanner: undefined;
};

// Drawer param list
export type RootDrawerParamList = {
  MainDashBoard: undefined;
  WebViewScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root navigation (Stack + Drawer nested)
const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MdnsScanner">
      {/* Landing page */}
      <Stack.Screen
        name="MdnsScanner"
        component={MdnsScanner}
        options={{ headerShown: true }}
      />

      {/* Drawer lives inside Stack */}
      <Stack.Screen
        name="AppDrawer"
        component={AppDrawer}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="BleScanner"
        component={BLEScanner}
      />

      {/* WifiScanner stays outside drawer */}
      <Stack.Screen
        name="WifiScanner"
        component={WifiScanner}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
