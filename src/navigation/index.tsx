import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MainDashBoard from '../screens/MainDashBoard';
import MdnsScanner from '../screens/MdnsScanner';
import BLEScanner from '../screens/BleScannerScreen';
import {CodeScannerPage} from '../screens/BarcodeScanner';

// Define all your routes here
export type RootStackParamList = {
  MdnsScanner: undefined;
  MainDashBoard: undefined; // or { someParam: string } if you want to pass params
  BleScanner:undefined;
  codeScanner:undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MdnsScanner"
    >
      <Stack.Screen
        name="MdnsScanner"
        component={MdnsScanner}
      />
      <Stack.Screen
        name="MainDashBoard"
        component={MainDashBoard}
      />
      <Stack.Screen
        name="BleScanner"
        component={BLEScanner}
      />
      <Stack.Screen
        name="codeScanner"
        component={CodeScannerPage}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
