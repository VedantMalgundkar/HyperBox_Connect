import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  MD2DarkTheme,
  MD2LightTheme,
} from "react-native-paper";

import App from "./src/RootNavigator";
import {
  CombinedDarkTheme,
  CombinedDefaultTheme,
} from "./utils/themes";

export default function PaperExample() {
  const isDarkMode = false;
  const [themeVersion, setThemeVersion] = React.useState<2 | 3>(3);

  // Pick Paper theme (MD2 or MD3 + light/dark)
  const theme = React.useMemo(() => {
    if (themeVersion === 2) {
      return isDarkMode ? MD2DarkTheme : MD2LightTheme;
    }
    return isDarkMode ? MD3DarkTheme : MD3LightTheme;
  }, [isDarkMode, themeVersion]);

  // Navigation theme
  const combinedTheme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <PaperProvider settings={{ rippleEffectEnabled: true }} theme={theme}>
      <NavigationContainer theme={combinedTheme}>
        <App />
      </NavigationContainer>
    </PaperProvider>
  );
}
