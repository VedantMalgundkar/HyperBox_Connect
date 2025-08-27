import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MainDashBoard from '../screens/MainDashBoard';
import MdnsScanner from '../screens/MdnsScanner';

// Define all your routes here
export type RootStackParamList = {
  MdnsScanner: undefined;
  MainDashBoard: undefined; // or { someParam: string } if you want to pass params
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MdnsScanner"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="MdnsScanner"
        component={MdnsScanner}
      />
      <Stack.Screen
        name="MainDashBoard"
        component={MainDashBoard}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
