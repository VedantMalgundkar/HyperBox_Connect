import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { commonStyles } from "../styles/common";
import { RootStackParamList } from "../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import WifiListWidget from "../components/WifiListWidget";
import { Appbar, useTheme, ProgressBar } from "react-native-paper";

type WifiScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WifiScanner"
>;

type WifiScannerRouteProp = RouteProp<RootStackParamList, "WifiScanner">;

const WifiScanner = () => {
  const navigation = useNavigation<WifiScannerNavigationProp>();
  const route = useRoute<WifiScannerRouteProp>();
  const theme = useTheme();
  const [wifiLoading, setWifiLoading] = useState<boolean>(false);

  const { deviceId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          <Appbar.BackAction
            onPress={() => navigation.goBack()}
            color={theme.colors.onPrimary}
          />
          
          <Appbar.Content
            title="Nearby Networks"
            titleStyle={{ color: theme.colors.onPrimary }}
          />
        </Appbar.Header>
      ),
    });
  }, [navigation, theme]);

  return (
    <View style={[styles.container]}>
      {wifiLoading && (
        <ProgressBar
          indeterminate
          color={theme.colors.primary}
          style={styles.loader}
        />
      )}

      <View style={styles.content}>
        <WifiListWidget
          deviceId={deviceId}
          isFetchApi={false}
          setWifiLoading={setWifiLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  container: {
    ...commonStyles.container,
    position:"relative",
  },
  content: {
    ...commonStyles.container,
    paddingHorizontal: 15,
  },
});

export default WifiScanner;
