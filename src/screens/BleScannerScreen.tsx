import React, { useEffect, useState, useLayoutEffect } from "react";
import { 
  View, 
  Text,
  TextInput,
  FlatList, 
  TouchableOpacity,
  Button,
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
import { storeRecentDevice, getRecentDevices } from "../services/storage/regularStorage";
import Toast from "react-native-toast-message";
import { useTheme } from "react-native-paper";

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
  const [deviceId, setDeviceId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const theme = useTheme();

  const recentConectedDevices = getRecentDevices();

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
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: theme.colors.onPrimary,
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
  const connectBleDevice = async (deviceId: string) => {
    if (!bleManager || !deviceId) return;
    try {
      // console.log("Connecting to", deviceId);
      // console.log("bleManager >>>>",bleManager);
      const connectedDevice = await connectToDevice(bleManager, deviceId);
      console.log("connected to >>>>>",connectedDevice.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      handleConnect(connectedDevice);
      storeRecentDevice(connectedDevice);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const isMacEmpty = (mac: string) => {
    return !mac.trim()
  }

  const isMacValid = (mac: string) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac.trim())
  }

  const handleInputDeviceIdConnect = async (deviceId: string): Promise<boolean> => {

    if (isConnecting) {
      console.log("already connecting >>>>");
      return false;
    }
    
    setIsConnecting(true);
    if (isMacEmpty(deviceId)) {
      Toast.show({
        type: "custom_snackbar",
        text1: "Please enter a device ID",
        position: "bottom",
        visibilityTime: 3000,
      });
      setIsConnecting(false);
      return false;
    }

    if (!isMacValid(deviceId)) {
      Toast.show({
        type: "custom_snackbar",
        text1: "Expected format: AA:BB:CC:DD:EE:FF",
        position: "bottom",
        visibilityTime: 4000,
      });
      setIsConnecting(false);
      return false;
    }

    await connectBleDevice(deviceId.trim());
    setIsConnecting(false);
    return true;
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
      console.log("Page Ble cleanup");
      disConnectBleDevice();
    };
  }, []);

  return (
    <View style={styles.container}>

      <QrScanner onScanned={async (value)=>{
        console.log("qr scanned >>>",value);
        return await handleInputDeviceIdConnect(value);
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

      <TextInput
        style={styles.input}
        placeholder="Enter Device ID"
        value={deviceId}
        onChangeText={setDeviceId}
        placeholderTextColor="#888"
      />
      <Button title="Connect" onPress={()=>handleInputDeviceIdConnect(deviceId)} />


      {/* <FlatList
        data={Object.values(devices)}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceText}>{item.name || "Unnamed Device"}</Text>
            <Text>ID: {item.id}</Text>

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
                onPress={() => connectBleDevice(item.id)}
              >
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      /> */}
      <FlatList
        data={recentConectedDevices}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceText}>{item.name || "Unnamed Device"}</Text>
            <Text>ID: {item.id}</Text>

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
                onPress={() => connectBleDevice(item.id)}
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
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
