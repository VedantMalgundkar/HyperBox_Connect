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
import { useConnection } from "../api/ConnectionContext";

interface BleDevice {
  id: string;
  name: string;
  rssi: number;
}

interface Props {
  device: BleDevice;
  disabled?: boolean;
  onConnect: (deviceId: string) => Promise<boolean>;
  onRedirectAfterConnect: () => void;
}

const BleDeviceTile: React.FC<Props> = ({ device, disabled = false, onConnect, onRedirectAfterConnect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme()
  const { bleDevice } = useConnection();
  
  const isConnected = bleDevice?.id == device.id;
  const actionLabel = isConnected ? "Setting" : "Connect"
  const deviceName = device.name.split("-")[0]


  const handlePress = async () => {
    if (disabled) return;
    setIsLoading(true);

    if(isConnected) {
      await onRedirectAfterConnect();
    } else {
      await onConnect(device.id);
    }
    setIsLoading(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor : theme.colors.surfaceVariant },
        isConnected && {borderColor:theme.colors.primary, borderWidth: 1},
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.title,{color: theme.colors.onSurfaceVariant}]}>
          {device.name?.length > 0 ? deviceName : "(No name)"}
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
          {backgroundColor:theme.colors.primary},
          (disabled || isLoading) && { opacity: 0.6 },
        ]}
        disabled={disabled || isLoading}
        onPress={handlePress}
      >
        {
          isLoading && (
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
          ) 
        }
        
        {
          isConnected && (
            <MaterialDesignIcons name="wifi-cog" color={theme.colors.onPrimary} />
          ) 
        }
        
        <Text
          style={[
            styles.btnText,
            { color: theme.colors.onPrimary }
          ]}
        >
          {actionLabel}
        </Text>

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
    position: "relative",
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
    flexDirection:"row",
    gap: 5,
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
