import React from 'react';
import { ScrollView, SafeAreaView, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer as PaperDrawer } from 'react-native-paper';
import MainDashBoard from '../screens/MainDashBoard';
import WebViewScreen from '../screens/WebView';
import { RootDrawerParamList } from '.';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTheme } from 'react-native-paper';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

// Custom drawer component
const CustomDrawerContent = (props: any) => {
  const theme = useTheme();

  return (
    <ScrollView>
      <SafeAreaView style={{ paddingTop: 60 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.onSurface,
            marginLeft: 16,
            marginBottom: 25,
          }}
        >
          HyperBox Connect
        </Text>

        <PaperDrawer.Section showDivider={false}>
          <PaperDrawer.Item
            label="Light Studio"
            icon={({ size, color }) => (
              <MaterialDesignIcons
                name="led-strip-variant"
                size={size}
                color={color}
              />
            )}
            active={props.state.index === 0}
            onPress={() => props.navigation.navigate('MainDashBoard')}
          />
          <PaperDrawer.Item
            label="HyperHDR Configuration"
            icon={({ size, color }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            )}
            active={props.state.index === 1}
            onPress={() => props.navigation.navigate('WebViewScreen')}
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
      <Drawer.Screen name="WebViewScreen" component={WebViewScreen} />
    </Drawer.Navigator>
  );
};

export default AppDrawer;
