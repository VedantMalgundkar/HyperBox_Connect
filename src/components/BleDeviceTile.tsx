import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { commonStyles } from "../styles/common";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useTheme } from "react-native-paper";

interface BleDevice {
  id: string;
  name: string;
  rssi: number;
}

interface Props {
  device: BleDevice;
  disabled?: boolean;
}

const BleDeviceTile: React.FC<Props> = ({ device, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const theme = useTheme()

  const handlePress = () => {
    if (disabled) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsConnected(!isConnected);
      setIsLoading(false);
    }, 1200); // fake delay
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor : theme.colors.surfaceVariant },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.title,{color: theme.colors.onSurfaceVariant}]}>
          {device.name?.length > 0 ? device.name : "(No name)"}
          <Text style={styles.dot}> • </Text>
          <Text style={styles.subText}><MaterialDesignIcons name="bluetooth" color={theme.colors.onSurfaceVariant}/></Text>
        </Text>
        <View style={styles.subtitleRow}>
          <Text style={[styles.subText, {color :theme.colors.onSurfaceVariant} ]}>{device.id}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          // isConnected ? {backgroundColor:theme.colors.primaryContainer} : {backgroundColor:theme.colors.primary},
          {backgroundColor:theme.colors.primary},
          (disabled || isLoading) && { opacity: 0.6 },
        ]}
        disabled={disabled || isLoading}
        onPress={handlePress}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={[
              styles.btnText,
              // isConnected ? { color: theme.colors.onPrimaryContainer } : { color: "#fff" },
              { color: theme.colors.onPrimary }
            ]}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.row,
    ...commonStyles.bRadius,
    padding: 12,
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitleRow: {
    ...commonStyles.row,
    flexWrap: "wrap",
  },
  subText: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 4,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  connectBtn: {
    backgroundColor: "#6200EE",
  },
  disconnectBtn: {
    backgroundColor: "#FFBABA",
  },
  btnText: {
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default BleDeviceTile;
