import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  PermissionsAndroid, 
  Platform, 
  Alert 
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const BLEScanner = () => {
  const [devices, setDevices] = useState<{ [id: string]: Device | any }>({
    "DC:A6:32:6A:83:19": {
      id: "DC:A6:32:6A:83:19",
      name: "Test Device",
      rssi: -42,
      mtu: 23,
      isConnectable: true,
      manufacturerData: null,
      serviceData: null,
      overflowServiceUUIDs: null,
      localName: "MockedDevice",
      serviceUUIDs: ["1234"],
      txPowerLevel: 4,
      solicitedServiceUUIDs: null,
    },
  });
  const [scanning, setScanning] = useState(false);
  const [manager, setManager] = useState<BleManager | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    return () => {
      bleManager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  const startScan = async () => {
    if (!manager) return;

    await requestPermissions();
    setDevices({});
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        setScanning(false);
        return;
      }

      if (device && device.name) {
        setDevices((prev) => ({ ...prev, [device.id]: device }));
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  // ✅ Connect method with callback
  const connectToDevice = async (device: Device, callback?: (success: boolean, dev?: Device) => void) => {
    if (!manager) return;

    try {
      console.log("Connecting to", device.name, device.id);
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();

      setConnectedDevice(connected);
      console.log("Connected:", connected.name);

      callback?.(true, connected);
    } catch (error) {
      console.error("Connection error:", error);
      callback?.(false);
    }
  };

  // ✅ Disconnect method with callback
  const disconnectFromDevice = async (device: Device, callback?: (success: boolean) => void) => {
    if (!manager) return;

    try {
      await manager.cancelDeviceConnection(device.id);
      if (connectedDevice?.id === device.id) {
        setConnectedDevice(null);
      }
      console.log("Disconnected:", device.name);
      callback?.(true);
    } catch (error) {
      console.error("Disconnection error:", error);
      callback?.(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: scanning ? "gray" : "blue",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {scanning ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={Object.values(devices)}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View
            style={{
              padding: 10,
              marginBottom: 5,
              backgroundColor: "#f0f0f0",
              borderRadius: 6,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>{item.name || "Unnamed Device"}</Text>
            <Text>ID: {item.id}</Text>
            <Text>RSSI: {item.rssi}</Text>

            {connectedDevice?.id === item.id ? (
              <TouchableOpacity
                style={{ backgroundColor: "red", padding: 8, borderRadius: 6, marginTop: 5 }}
                onPress={() => disconnectFromDevice(item, (success) => {
                  if (success) Alert.alert("Disconnected", `Disconnected from ${item.name}`);
                })}
              >
                <Text style={{ color: "white", textAlign: "center" }}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{ backgroundColor: "green", padding: 8, borderRadius: 6, marginTop: 5 }}
                onPress={() => connectToDevice(item, (success, dev) => {
                  if (success && dev) {
                    Alert.alert("Connected", `Connected to ${dev.name}`);
                  } else {
                    Alert.alert("Failed", "Could not connect");
                  }
                })}
              >
                <Text style={{ color: "white", textAlign: "center" }}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default BLEScanner;
