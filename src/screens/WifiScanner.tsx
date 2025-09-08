import React, { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { commonStyles } from "../styles/common";
import { RootStackParamList } from "../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import WifiListWidget from "../components/WifiListWidget";

type WifiScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WifiScanner"
>;

const WifiScanner = () => {
  const navigation = useNavigation<WifiScannerNavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Nearby Networks",
      headerStyle: {
        backgroundColor: "#6200ee",
      },
      headerTintColor: "#fff",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <WifiListWidget deviceId="test" isFetchApi={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    paddingHorizontal: 15,
  },
});

export default WifiScanner;
