import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation, useTheme as useNavTheme } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import HyperhdrScannerContent from "../components/HyperhdrScannerContent";

// Paper components
import { useTheme, Appbar, Button } from "react-native-paper";
import { useNetworkDialog } from "../api/NetworkDialogContext";

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MdnsScanner"
>;

export default function MdnsScanner() {
  const navigation = useNavigation<MdnsScannerNavigationProp>();
  const theme = useTheme(); // Paper theme
  const { showErrorDialog } = useNetworkDialog();

  const handleOpen = () => {
    navigation.replace("MainDashBoard");
  };

  // 👇 Move header into setOptions
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.Content
            title="My Devices"
            titleStyle={{ color: theme.colors.onPrimary }}
          />
          <Appbar.Action
            icon="plus"
            color={theme.colors.onPrimary}
            onPress={() => navigation.navigate("BleScanner")}
            // onPress={() => navigation.navigate("MainDashBoard")}
          />
        </Appbar.Header>
      ),
    });
  }, [navigation, theme]);

  return (
    // Content area
    <HyperhdrScannerContent onConnect={handleOpen} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
});
