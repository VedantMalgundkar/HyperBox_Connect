import React, { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { commonStyles } from "../styles/common";
import { RootStackParamList } from "../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import WifiListWidget from "../components/WifiListWidget";

type WifiScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WifiScanner"
>;

type WifiScannerRouteProp = RouteProp<RootStackParamList, "WifiScanner">;

const WifiScanner = () => {
  const navigation = useNavigation<WifiScannerNavigationProp>();
  const route = useRoute<WifiScannerRouteProp>();

  const { deviceId } = route.params;

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
      <WifiListWidget deviceId={deviceId} isFetchApi={false} />
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
