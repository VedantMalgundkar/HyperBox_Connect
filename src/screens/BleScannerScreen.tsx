import React, { useEffect, useState, useLayoutEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  PermissionsAndroid, 
  Platform, 
  Alert, 
  StyleSheet
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { commonStyles } from "../styles/common";
import { RootStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import QrScanner from "../components/QrScanner";
import { useConnection } from "../api/ConnectionContext";
import { connectToDevice, disconnect } from "../services/bleService";

type BleScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BleScanner'
>;

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

  const { 
    bleManager, 
    handleConnect,
    handleDisconnect, 
    bleDeviceId} = useConnection();
  const [scanning, setScanning] = useState(false);
  const navigation = useNavigation<BleScannerNavigationProp>();

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Scan Device",
      headerStyle: {
        backgroundColor: "#6200ee",
      },
      headerTintColor: "#fff",
    });
  }, [navigation]);

  const startScan = async () => {
    if (!bleManager) return;

    await requestPermissions();
    setDevices({});
    setScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
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
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const handleRedirect = () => {
    if(bleDeviceId){
      navigation.navigate('WifiScanner',{ deviceId: bleDeviceId });
    }
  }

  useEffect(()=>{
    handleRedirect();
  },[bleDeviceId])

  // ✅ Connect method with callback
  const connectBleDevice = async (device: Device) => {
    if (!bleManager) return;
    try {
      console.log("Connecting to", device.name, device.id);
      console.log("bleManager >>>>",bleManager);
      const connectedDevice = await connectToDevice(bleManager, device.id);
      console.log("connected to >>>>>",connectedDevice.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      handleConnect(connectedDevice);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  // ✅ Disconnect method with callback
  const disConnectBleDevice = async () => {
    if (!bleManager) return;
    try {
      if(bleDeviceId) {
        disconnect(bleManager, bleDeviceId);
        handleDisconnect();
      }
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  useEffect(() => {
    console.log("Page Ble mounted");

    return () => {
      console.log("Page Ble cleanup"); // runs only if Ble unmounts
    };
  }, []);

  return (
    <View style={styles.container}>

      <QrScanner onScanned={(value)=>{
        console.log("qr scanned >>>",value);
      }}/>

      {/* <BarcodeScanner/> */}
      <TouchableOpacity
        style={[styles.scanButton, scanning && styles.scanButtonScanning]}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.scanButtonText}>
          {scanning ? "Scanning..." : "Start Scan"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={Object.values(devices)}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceText}>{item.name || "Unnamed Device"}</Text>
            <Text>ID: {item.id}</Text>
            <Text>RSSI: {item.rssi}</Text>

            {bleDeviceId === item.id ? (
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disConnectBleDevice}
              >
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => connectBleDevice(item)}
              >
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    padding: 20,
  },
  scanButton: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  scanButtonScanning: {
    backgroundColor: "gray",
  },
  scanButtonText: {
    color: "white",
    textAlign: "center",
  },
  deviceItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  deviceText: {
    fontWeight: "bold",
  },
  connectButton: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  disconnectButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default BLEScanner;
