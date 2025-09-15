import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  MD3LightTheme,
  MD3DarkTheme,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import merge from "deepmerge";

import AppNavigator from "./src/navigation";
import { lightTheme, darkTheme } from "./src/styles/theme";
import { ConnectionProvider } from "./src/api/ConnectionContext";
import { ToastProvider } from "./src/api/ToastProvider";

const { LightTheme: navLight, DarkTheme: navDark } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedLightTheme = merge(navLight, {
  ...MD3LightTheme,
  colors: lightTheme.colors,
});

const CombinedDarkTheme = merge(navDark, {
  ...MD3DarkTheme,
  colors: darkTheme.colors,
});

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  const theme = isDarkMode ? CombinedDarkTheme : CombinedLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          translucent={false}
          backgroundColor={theme.colors.primary}  // 👈 match AppBar background
          barStyle={isDarkMode ? "light-content" : "dark-content"}
        />
        <ConnectionProvider>
          <PaperProvider theme={theme}>
            <NavigationContainer theme={theme}>
              <ToastProvider>
                <AppNavigator />
              </ToastProvider>
            </NavigationContainer>
          </PaperProvider>
        </ConnectionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
