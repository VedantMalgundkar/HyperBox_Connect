// App.tsx
import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from "@react-navigation/native";

import AppNavigator from "./src/navigation";
import { lightTheme, darkTheme } from "./src/styles/theme"; // your MUI-style Paper themes
import { ConnectionProvider } from "./src/api/ConnectionContext";

// ✅ Merge only colors for Navigation
const navLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...lightTheme.colors, // only colors
  },
};

const navDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkTheme.colors, // only colors
  },
};

export default function App() {
  const isDarkMode = useColorScheme() === "dark";
  const paperTheme = isDarkMode ? darkTheme : lightTheme;
  const navTheme = isDarkMode ? navDarkTheme : navLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <ConnectionProvider>
          {/* PaperProvider gets full MD3 theme */}
          <PaperProvider theme={paperTheme}>
            {/* NavigationContainer gets only colors */}
            <NavigationContainer theme={navTheme}>
              <AppNavigator />
            </NavigationContainer>
          </PaperProvider>
        </ConnectionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
