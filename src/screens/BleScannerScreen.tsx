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
  Linking,
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
import { reqBluetooth, reqBluetoothPerms } from "../utils/permissions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import BleDeviceTile from "../components/BleDeviceTile";
import { Appbar } from "react-native-paper";
import { useToast } from "../api/ToastProvider";
import { CommonDialog } from "../components/CommonDialog";

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
  const [isPermissionPopUpOpen, setIsPermissionPopUpOpen] = useState<boolean>(false);
  const [isBluetoothPopupOpen, setIsBluetoothPopupOpen] = useState<boolean>(false);
  const [isCameraPermissionPopupOpen, setIsCameraPermissionPopupOpen] = useState<boolean>(false);

  const recentConectedDevices = getRecentDevices();

  useEffect(() => {
    const askBluetoothPermissions = async () => {
      await reqBluetoothPerms(()=>setIsPermissionPopUpOpen(true));
    }

    askBluetoothPermissions()
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

  const handleRedirect = () => {
    if (bleDevice?.id) {
      navigation.navigate('WifiScanner', { deviceId: bleDevice.id, isBluetoothConnected: !!bleDevice?.id});
    }
  }
  
  const fakeRedirect = () => {
    navigation.navigate('WifiScanner', { deviceId: "hiii", isBluetoothConnected: false });
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

    const bluetoothPower = await reqBluetooth(bleManager,()=>setIsBluetoothPopupOpen(true));
    if(!bluetoothPower) {
      return false;
    }

    const permRes = await reqBluetoothPerms(()=>setIsPermissionPopUpOpen(true));

    if (permRes !== "granted") {
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
        }} 
        onCameraPermissionDenied={(shouldOpen)=>setIsCameraPermissionPopupOpen(shouldOpen)}/>
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

      <CommonDialog
        visible = {isBluetoothPopupOpen}
        onDismiss = {()=>setIsBluetoothPopupOpen(false)}
        title = "Bluetooth required"
        bodyText = "Please turn on Bluetooth to connect to device."
        okText = "Ok"
        onOk= {()=>setIsBluetoothPopupOpen(false)}
        showCancel = {false}
      />

      <CommonDialog
        visible = {isCameraPermissionPopupOpen}
        onDismiss = {()=>setIsCameraPermissionPopupOpen(false)}
        title = "Permission required"
        bodyText = "Please enable camera permission in Settings."
        okText = "Open Settings"
        onOk= {()=>Linking.openSettings()}
        cancelText = "Cancel"
      />

      <CommonDialog
        visible = {isPermissionPopUpOpen}
        onDismiss = {()=>setIsPermissionPopUpOpen(false)}
        title = "Permission required"
        bodyText = "Please enable Nearby Devices and Location permissions in Settings."
        okText = "Open Settings"
        onOk= {()=>Linking.openSettings()}
        cancelText = "Cancel"
      />
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
