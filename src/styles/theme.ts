// src/styles/theme.ts
import { MD3LightTheme, MD3DarkTheme, MD3Theme } from "react-native-paper";

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      outline?: string; // add custom color
    }

    interface Theme {
      roundness?: number; // add custom property
    }
  }
}

// Light theme - Updated to match the screenshot exactly
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    // primary: "#00838f",      // Cyan/dark teal for primary elements (like "Latest" text)
    // onPrimary: "#ffffff",    // White text on primary
    // secondary: "#4fb3bf",    // Medium cyan for secondary elements
    // onSecondary: "#000000",  // Black text on secondary
    // background: "#f5f5f5",   // Light gray background
    // surface: "#ffffff",      // White surface/cards (used for app bar)
    // error: "#d32f2f",        // Red for errors
    // onSurface: "#000000",    // Black text on surfaces (like most text)
    // outline: "#e0e0e0",      // Light gray for outlines/divider (matches screenshot)
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: "Roboto",
      fontWeight: "400" as const,
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: "Roboto",
      fontWeight: "500" as const,
    },
  }
};

// Dark theme - Updated to be consistent with light theme
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    // primary: "#4db6ac",      // Medium cyan for primary
    // onPrimary: "#000000",    // Black text on primary
    // secondary: "#80deea",    // Light cyan for secondary
    // onSecondary: "#000000",  // Black text on secondary
    // background: "#121212",   // Dark background
    // surface: "#1e1e1e",      // Dark surface (used for app bar)
    // error: "#f44336",        // Red for errors
    // onSurface: "#ffffff",    // White text on surfaces
    // outline: "#37474f",      // Dark gray for outlines/divider
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: {
      ...MD3DarkTheme.fonts.bodyLarge,
      fontFamily: "Roboto",
      fontWeight: "400" as const,
    },
    titleLarge: {
      ...MD3DarkTheme.fonts.titleLarge,
      fontFamily: "Roboto",
      fontWeight: "500" as const,
    },
  }
};