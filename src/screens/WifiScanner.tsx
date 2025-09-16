import React, { useLayoutEffect } from "react";
import { commonStyles } from "../styles/common";
import { RootStackParamList } from "../navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import WifiListWidget from "../components/WifiListWidget";
import { Appbar, useTheme } from "react-native-paper";
import { View } from "react-native";

type WifiScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WifiScanner"
>;

type WifiScannerRouteProp = RouteProp<RootStackParamList, "WifiScanner">;

const WifiScanner = () => {
  const navigation = useNavigation<WifiScannerNavigationProp>();
  const route = useRoute<WifiScannerRouteProp>();
  const theme = useTheme();

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
    <View style={commonStyles.container}>
      <WifiListWidget
        deviceId={deviceId}
        isFetchApi={false}
      />
    </View>
  );
};

export default WifiScanner;
