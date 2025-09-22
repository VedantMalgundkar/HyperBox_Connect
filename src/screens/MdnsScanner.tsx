import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation, useTheme as useNavTheme } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import HyperhdrScannerContent from "../components/HyperhdrScannerContent";

// Paper components
import { useTheme, Appbar, Button } from "react-native-paper";
import { NetworkDiagram } from "../components/NetworkDiagram";
import { CommonDialog } from "../components/CommonDialog";

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MdnsScanner"
>;

export default function MdnsScanner() {
  const navigation = useNavigation<MdnsScannerNavigationProp>();
  const theme = useTheme(); // Paper theme
  const [isErrorInfoDialogOpen, setIsErrorInfoDialogOpen] = useState<boolean>(true)

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
    // <HyperhdrScannerContent onConnect={handleOpen} />
    <View style={styles.container}>
      <CommonDialog
        visible={isErrorInfoDialogOpen}
        onDismiss={() => setIsErrorInfoDialogOpen(false)}
        okText="Ok"
        onOk={() => setIsErrorInfoDialogOpen(false)}
        showCancel={false}
      >
        <NetworkDiagram />
      </CommonDialog>

      <Button mode="contained" onPress={() => setIsErrorInfoDialogOpen(true)}>Show Dialog</Button>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
});
