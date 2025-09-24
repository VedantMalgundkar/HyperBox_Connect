import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer as PaperDrawer } from 'react-native-paper';
import MainDashBoard from '../screens/MainDashBoard';
import BLEScanner from '../screens/BleScannerScreen';
import { CodeScannerPage } from '../screens/BarcodeScanner';
import { RootDrawerParamList } from '.';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

// Custom drawer component
const CustomDrawerContent = (props: any) => {
  return (
    <ScrollView>
      <SafeAreaView>
        <PaperDrawer.Section>
          <PaperDrawer.Item
            label="Main Dashboard"
            active={props.state.index === 0}
            onPress={() => props.navigation.navigate('MainDashBoard')}
          />
          <PaperDrawer.Item
            label="BLE Scanner"
            active={props.state.index === 1}
            onPress={() => props.navigation.navigate('BleScanner')}
          />
          <PaperDrawer.Item
            label="Code Scanner"
            active={props.state.index === 2}
            onPress={() => props.navigation.navigate('CodeScanner')}
          />
        </PaperDrawer.Section>
      </SafeAreaView>
    </ScrollView>
  );
};

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="MainDashBoard"
      screenOptions={{ headerShown: true }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="MainDashBoard" component={MainDashBoard} />
      <Drawer.Screen name="BleScanner" component={BLEScanner} />
      <Drawer.Screen name="CodeScanner" component={CodeScannerPage} />
    </Drawer.Navigator>
  );
};

export default AppDrawer;
