import React, { useLayoutEffect } from "react";
import { StyleSheet } from "react-native";
import { useNavigation, useTheme as useNavTheme } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import HyperhdrScannerContent from "../components/HyperhdrScannerContent";

// Paper components
import { useTheme, Appbar } from "react-native-paper";

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MdnsScanner"
>;

export default function MdnsScanner() {
  const navigation = useNavigation<MdnsScannerNavigationProp>();
  const theme = useTheme(); // Paper theme

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
    paddingHorizontal: 15,
  },
});
