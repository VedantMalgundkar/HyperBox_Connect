import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

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

  // normalize RSSI (-100..-30 => 0..100)
  const normalizeRssi = (rssi: number) => {
    const min = -100;
    const max = -30;
    if (rssi <= min) return 0;
    if (rssi >= max) return 100;
    return Math.round(((rssi - min) * 100) / (max - min));
  };

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
        isConnected && { borderColor: "#90EE90", borderWidth: 2 },
      ]}
    >
      <View style={styles.info}>
        <Text style={styles.title}>
          {device.name?.length > 0 ? device.name : "(No name)"}
        </Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subText}>{device.id}</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.subText}>RSSI: {normalizeRssi(device.rssi)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isConnected ? styles.disconnectBtn : styles.connectBtn,
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
              isConnected ? { color: "#B22222" } : { color: "#fff" },
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
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  subText: {
    fontSize: 12,
    color: "#555",
  },
  dot: {
    fontSize: 12,
    color: "#555",
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
    fontSize: 14,
  },
});

export default BleDeviceTile;
