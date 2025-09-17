import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Device, State } from "react-native-ble-plx";
import { commonStyles } from "../styles/common";
import { RootStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import QrScanner from "../components/QrScanner";
import { useConnection } from "../api/ConnectionContext";
import { connectToDevice, disconnect } from "../services/bleService";
import { storeRecentDevice, getRecentDevices } from "../services/storage/regularStorage";
import Toast from "react-native-toast-message";
import { useTheme, Button, TextInput } from "react-native-paper";
import { handlePermissions } from "../utils/permissions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import BleDeviceTile from "../components/BleDeviceTile";
import { Appbar } from "react-native-paper";
import { useToast } from "../api/ToastProvider";


type BleScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BleScanner'
>;

// Helper to generate random MAC address
const getRandomMac = () =>
  Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join(":").toUpperCase()

// Helper to generate random device
const generateRandomDevice = () => {
  const id = getRandomMac()
  return {
    id,
    name: `Device-${Math.floor(Math.random() * 1000)}`,
    rssi: -Math.floor(Math.random() * 100), // -0 to -99
    mtu: 23 + Math.floor(Math.random() * 100),
    isConnectable: Math.random() > 0.2,
    manufacturerData: null,
    serviceData: null,
    overflowServiceUUIDs: null,
    localName: `MockDevice-${Math.floor(Math.random() * 1000)}`,
    serviceUUIDs: ["1234"],
    txPowerLevel: Math.floor(Math.random() * 10),
    solicitedServiceUUIDs: null,
  }
}

const BLEScanner = () => {
  // const [devices, setDevices] = useState<{ [id: string]: Device | any }>({
  //   "DC:A6:32:6A:83:19": {
  //     id: "DC:A6:32:6A:83:19",
  //     name: "Test Device",
  //     rssi: -42,
  //     mtu: 23,
  //     isConnectable: true,
  //     manufacturerData: null,
  //     serviceData: null,
  //     overflowServiceUUIDs: null,
  //     localName: "MockedDevice",
  //     serviceUUIDs: ["1234"],
  //     txPowerLevel: 4,
  //     solicitedServiceUUIDs: null,
  //   },
  // });

  // const [devices, setDevices] = useState<{ [id: string]: any }>({})

  // useEffect(() => {
  //   const mockDevices: { [id: string]: any } = {}
  //   for (let i = 0; i < 10; i++) {
  //     const device = generateRandomDevice()
  //     mockDevices[device.id] = device
  //   }
  //   setDevices(mockDevices)
  // }, [])

  const {
    bleManager,
    handleConnect,
    handleDisconnect,
    bleDevice } = useConnection();

  // const [scanning, setScanning] = useState(false);
  const navigation = useNavigation<BleScannerNavigationProp>();
  const [deviceId, setDeviceId] = useState("");
  const [whichDeviceIsConnecting, setWhichDeviceIsConnecting] = useState<string|null>(null);
  const theme = useTheme();
  const showToast = useToast();

  const recentConectedDevices = getRecentDevices();

  // const requestPermissions = async (
  //   permissions: Permission[]
  // ): Promise<"granted" | "denied" | "blocked"> => {

  //   const result = await PermissionsAndroid.requestMultiple(permissions);
  //   const values = Object.values(result);

  //   if (values.every((v) => v === PermissionsAndroid.RESULTS.GRANTED)) {
  //     return "granted";
  //   }

  //   if (values.some((v) => v === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
  //     return "blocked"; // must go to settings
  //   }

  //   return "denied"; // denied, can ask again
  // };

  // const handlePermissions = async (permissions: Permission[]): Promise<boolean> => {
  //   const status = await requestPermissions(permissions);

  //   console.log({ status });

  //   if (status === "granted") {
  //     console.log("✅ All permissions granted");
  //     return true;
  //   } else if (status === "denied") {
  //     console.log("❌ Permissions denied, can try again later");
  //     return false;
  //   } else if (status === "blocked") {
  //     Alert.alert(
  //       "Permission required",
  //       "Please enable permissions in Settings.",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         { text: "Open Settings", onPress: () => Linking.openSettings() },
  //       ]
  //     );
  //     return false;
  //   }

  //   return false;
  // };

  const reqBluetooth = async () => {
    const requiredPermissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ];

    return await handlePermissions(requiredPermissions);
  }

  const reqCamera = async () => {
    const requiredPermissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ];

    return await handlePermissions(requiredPermissions);
  };

  useEffect(() => {
    reqBluetooth();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          {/* Back button */}
          <Appbar.BackAction
            onPress={() => navigation.goBack()}
            color={theme.colors.onPrimary}
          />

          {/* Title */}
          <Appbar.Content
            title="Scan Device"
            titleStyle={{ color: theme.colors.onPrimary }}
          />
        </Appbar.Header>
      ),
    });
  }, [navigation, theme]);

  // const startScan = async () => {
  //   console.log("scan started >>>>");
  //   if (!bleManager) return;

  //   const permRes = await reqBluetooth();

  //   if (!permRes) {
  //     console.log("permission response >>",permRes);
  //     return;
  //   }

  //   setDevices({});
  //   setScanning(true);

  //   bleManager.startDeviceScan(null, null, (error, device) => {
  //     if (error) {
  //       console.log("Scan error:", error);
  //       setScanning(false);
  //       return;
  //     }

  //     if (device && device.name) {
  //       setDevices((prev) => ({ ...prev, [device.id]: device }));
  //     }
  //   });

  //   setTimeout(() => {
  //     bleManager.stopDeviceScan();
  //     setScanning(false);
  //   }, 10000);
  // };

  const handleRedirect = () => {
    if (bleDevice?.id) {
      navigation.navigate('WifiScanner', { deviceId: bleDevice.id });
    }
  }
  
  const fakeRedirect = () => {
    navigation.navigate('WifiScanner', { deviceId: "hiii" });
  }

  useEffect(() => {
    handleRedirect();
  }, [bleDevice?.id])

  // ✅ Connect method with callback
  const connectBleDevice = async (deviceId: string) => {
    if (!bleManager || !deviceId) return;
    try {
      // console.log("Connecting to", deviceId);
      // console.log("bleManager >>>>",bleManager);
      const connectedDevice = await connectToDevice(bleManager, deviceId);
      console.log("connected to >>>>>", connectedDevice.id);
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

  const handleInputDeviceIdConnect = async (
    deviceId: string,
  ): Promise<boolean> => {
    const state = await bleManager.state();

    if (state !== State.PoweredOn) {
      console.log("❌ Bluetooth is off");
      Alert.alert(
        "Bluetooth Required",
        "Please turn on Bluetooth to connect to device."
      );
      return false;
    }

    const permRes = await reqBluetooth();

    if (!permRes) {
      console.log("permission response >>", permRes);
      return false;
    }

    if (whichDeviceIsConnecting) {
      console.log("already connecting >>>>");
      return false;
    }

    setWhichDeviceIsConnecting(deviceId);

    if (isMacEmpty(deviceId)) {
      showToast({ message: "Please enter a device ID", duration: 3000 });
      setWhichDeviceIsConnecting(null);
      return false;
    }

    if (!isMacValid(deviceId)) {
      showToast({
        message: "Expected format: AA:BB:CC:DD:EE:FF",
        duration: 4000,
      });
      setWhichDeviceIsConnecting(null);
      return false;
    }

    await connectBleDevice(deviceId.trim());
    setWhichDeviceIsConnecting(null);
    return true;
  };

  // ✅ Disconnect method with callback
  const disConnectBleDevice = async (bleDeviceId: string) => {
    console.log("in disConnectBleDevice >>");
    if (!bleManager) return;
    console.log("found bleManager >>>", bleManager);
    console.log("ble deviceId >>>", bleDeviceId);
    try {
      if (bleDevice?.id) {
        await disconnect(bleManager, bleDeviceId);
        console.log("disconnected >>>");
        handleDisconnect();
      }
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  useEffect(() => {
    console.log("Page Ble mounted");

    return () => {
      console.log("Page Ble cleanup >>>>",bleDevice?.id);
      if(bleDevice?.id){
        disConnectBleDevice(bleDevice.id);
      }
    };
  }, [bleDevice?.id]);

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
    >
      <View style={{ alignItems: "center" }}>
        <QrScanner onScanned={async (value) => {
          console.log("qr scanned >>>", value)
          return await handleInputDeviceIdConnect(value)
        }} />
      </View>

      {/* <View style={{ gap: 12 }}> */}
      <TextInput
        mode="outlined"
        label="Device ID"
        placeholder="Enter Device ID"
        value={deviceId}
        onChangeText={setDeviceId}
      />

      <Button
        mode="contained"
        onPress={() => handleInputDeviceIdConnect(deviceId)}
        loading={!!whichDeviceIsConnecting}
        disabled={!!whichDeviceIsConnecting}
      >
        Connect
      </Button>
      
      <Button
        mode="contained"
        onPress={fakeRedirect}
        loading={!!whichDeviceIsConnecting}
        disabled={!!whichDeviceIsConnecting}
      >
        redirect
      </Button>
      {/* </View> */}

      {
        recentConectedDevices.length > 0 &&
        <>
          <Text style={[styles.recentDevicesTitle, { color: theme.colors.onSurface }]}>
            Recently Connected Devices
          </Text>

          {recentConectedDevices.map((item: any) => (
            <BleDeviceTile key={item.id} device={item} disabled={false} onConnect={handleInputDeviceIdConnect} onRedirectAfterConnect={handleRedirect} />
          ))}
        </>
      }
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: "column",
    gap: 20,
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  recentDevicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
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
