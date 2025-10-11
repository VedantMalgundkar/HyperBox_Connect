import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  // TextInput,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import CommonModal from './CommonModal';
import {
  discoverAndReadWifi,
  sendWifiAction,
  writeCredentials,
  listenWifiStatus,
} from '../services/bleService';
import { WifiNetwork } from '../services/bleService';
import { useConnection } from '../api/ConnectionContext';
import { useTheme, ProgressBar, TextInput, Button } from 'react-native-paper';
import { useToast } from '../api/ToastProvider';
import { commonStyles } from '../styles/common';
import { WifiCredsDialog } from './WifiCredsDialog';
import { connectToDevice, disconnect } from '../services/bleService';
import { storeRecentDevice } from '../services/storage/regularStorage';
import { checkBluetooth, fakeApi, reqBluetooth, reqBluetoothPerms } from '../utils/permissions';
import { CommonDialog } from './CommonDialog';
import { useSysApi } from '../api/sysApi';
import { State, Subscription } from "react-native-ble-plx";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  deviceId: string;
  isBluetoothConnected: boolean;
  onBluetoothOff: () => void;
};

interface bleResponse {
  status: 'connecting' | 'success' | 'failed' | 'forgetting';
  message?: string;
  error?: string;
}

type BleSubscription = Subscription | { remove: () => void } | undefined;

interface WifiNetworkWithId extends WifiNetwork {
  id: string;
}

const WifiListWidget: React.FC<Props> = ({ deviceId, isBluetoothConnected, onBluetoothOff }) => {
  const [wifiList, setWifiList] = useState<WifiNetworkWithId[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [wifiLoading, setWifiLoading] = useState<boolean>(false);
  const [wifiNotifyLoading, setWifiNotifyLoading] = useState<boolean>(false);
  const [initLoading, setInitLoading] = useState<boolean>(false);

  const { bleDevice, handleConnect, handleDisconnect } = useConnection();
  const showToast = useToast();

  console.log('WifiListWidget bleDeviceId >>', bleDevice?.id);

  const isOverAllLoaing = wifiLoading || wifiNotifyLoading || initLoading;

  // 🔑 For modal
  const [selectedSsid, setSelectedSsid] = useState<string | undefined>(undefined);

  const [menuForWifi, setMenuForWifi] = useState<WifiNetwork | undefined>(undefined);

  const [isPermissionPopUpOpen, setIsPermissionPopUpOpen] = useState<boolean>(false);
  // const [isBluetoothPopupOpen, setIsBluetoothPopupOpen] = useState<boolean>(false);
  // const [bleConnRefresh, setBleConnRefresh] = useState<boolean>(false);
  const [isBluetoothConnectionError, setIsBluetoothConnectionError] = useState<boolean>(false);

  const { bleManager } = useConnection();
  const theme = useTheme();
  const { scanNearbyNetworks } = useSysApi();

  const menuOptions = [
    ...(menuForWifi?.u === 1 ? ['Disconnect'] : ['Connect']),
    ...(menuForWifi?.sav === 1 ? ['Forget'] : []),
  ];

  const connectBleDevice = async (deviceId: string) => {
    if (!bleManager || !deviceId) return;
    
    const connectedDevice = await connectToDevice(bleManager, deviceId);
    console.log("connected to >>>>>", connectedDevice.id);
    await connectedDevice.discoverAllServicesAndCharacteristics();
    handleConnect(connectedDevice);
    storeRecentDevice(connectedDevice);
  };

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
      console.log("Disconnection error:", error);
    }
  };

  const handleInputDeviceIdConnect = async (
    deviceId: string,
  ): Promise<boolean> => {

    const bluetoothPower = await reqBluetooth(bleManager, () => setIsBluetoothConnectionError(true));
    if (!bluetoothPower) {
      return false;
    }

    const permRes = await reqBluetoothPerms(() => setIsPermissionPopUpOpen(true));

    if (permRes !== "granted") {
      console.log("permission response >>", permRes);
      return false;
    }

    await connectBleDevice(deviceId.trim());
    return true;
  };

  const responseListener = () => {
    const handleRecievedData = (data: bleResponse) => {
      console.log('data received from ble >>', data);
      const anyOnGoingProcess = data.status.toLowerCase().endsWith("ing");
      const isSuccess = data.status == 'success';

      let msg = data?.message; 
      if(data?.error) {
        msg = data.error
      }
      
      if (anyOnGoingProcess) {
        setWifiNotifyLoading(true);
      }

      if (isSuccess && !anyOnGoingProcess) {
        setWifiNotifyLoading(false);
      }
      
      if(msg && !isSuccess) {
        showToast({ message: msg, duration: 3000 });
      }

      if(isSuccess) {
        loadWifiList();
      }
    };

    const handleError = (error: Error) => {
      console.log('error recieved from ble >>', error.message);
    };

    try {
      const subs = listenWifiStatus(
        bleManager,
        deviceId,
        handleRecievedData,
        handleError,
      );

      return subs;

    } catch (error: any) {
      console.log("listenWifiStatus error >>", error.message);
    }

  };

  const loadWifiList = useCallback(async () => {
    setWifiLoading(true);
    try {
      let result: WifiNetwork[] = [];

      if (isBluetoothConnected) {
        console.log('Fetching wifilist via BLE...');
        // if (!await checkBluetooth(bleManager)) {
        //   console.log("bluetooth suppose to br turned on >>>");
        //   return;
        // }
        const bluetoothPower = await reqBluetooth(bleManager, () => setIsBluetoothConnectionError(true));
        if (!bluetoothPower) {
          return;
        }
        console.log("checking ble deviceId in loadWifiLis", { deviceId })
        result = await discoverAndReadWifi(bleManager, deviceId);
      } else {
        console.log('Fetching wifilist via API...');
        const resp = await scanNearbyNetworks();
        // console.log("scanNearbyNetworks >>>",resp)
        result = resp.networks;
      }
      console.log('loadWifiList >>>>', result);

      if (result) {
        setWifiList(
          result.map(wifi => ({
            ...wifi,
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          })),
        );
      }
    } catch (e) {
      console.error('Error loading Wi-Fi list:', e);
    } finally {
      setWifiLoading(false);
      setRefreshing(false);
    }
  }, [isBluetoothConnected, deviceId]);

  useEffect(() => {

    // Load Wi-Fi list immediately, no need to wait for BLE init when redirected from main dashboard.
    loadWifiList();

    const init = async () => {
      console.log("before init bleDevice?.id >>>", bleDevice?.id);

      if (!await checkBluetooth(bleManager)) {
        console.log("bluetooth is off");
        return;
      }

      if (bleDevice?.id) {
        console.log("Already connected >>>>", deviceId);
        return;
      }
      setInitLoading(true);
      try {
        if (!isBluetoothConnected) {
          console.log("Connect BLE device: ", deviceId);
          // await fakeApi(5000);
          try {
            await handleInputDeviceIdConnect(deviceId);
            setIsBluetoothConnectionError(false);
          } catch (error) {
            setIsBluetoothConnectionError(true);
            showToast({
              message: "Something went wrong, try again!",
              duration: 5000,
              action: {
                label: "Retry",
                onPress: async () => {
                  console.log("Retry pressed!");
                  await handleInputDeviceIdConnect(deviceId.trim());
                },
              },
            });
          }
        }
      } catch (e) {
        console.warn("BLE init failed:", e);
      } finally {
        setInitLoading(false);
      }
    };

    // 🔹 Always watch Bluetooth state
    let subscription: { remove: () => void } | undefined;

    const blutoothWatcher = bleManager.onStateChange(async (state) => {
      console.log("Bluetooth state:", state);

      if (state === State.PoweredOn) {
        await init();
        // 🔹 Only subscribe if we have a device AND Bluetooth is ON
        if (bleDevice?.id && !subscription) {
          subscription = responseListener();
          console.log("responseListener subscription applied >>>>>>", subscription);
        } else {
          console.log("Skipping responseListener, conditions not met", {
            globalDeviceId: bleDevice?.id,
            subscription,
          });
        }
        console.log("blue on >>>>")
        // setIsbluetoothOn(true);
      }

      if (state === State.PoweredOff) {
        bleCleanUp(undefined, subscription);
        subscription = undefined;
        console.log("blue off >>>>");
        // setIsBluetoothPopupOpen(true);
        // setShouldGoBack(true);
        setIsBluetoothConnectionError(true);
        await disConnectBleDevice(deviceId);
      }
    }, true); // true = run immediately with current state

    return () => {
      // disconnect if bluetooth is connected on this page
      if (!isBluetoothConnected) { 
        const disconnectBle = async () => await disConnectBleDevice(deviceId);
        disconnectBle();
      }

      bleCleanUp(blutoothWatcher, subscription);
    };
  // }, [bleManager, deviceId, bleDevice?.id, bleConnRefresh]);
  }, [bleManager, deviceId, bleDevice?.id]);

  const bleCleanUp = (
    blutoothWatcher?: BleSubscription,
    listenerSubscription?: BleSubscription
  ) => {
    if (blutoothWatcher) {
      console.log({ blutoothWatcher });
      blutoothWatcher.remove();
      console.log("blutoothWatcher removed");
    }

    if (listenerSubscription) {
      console.log({ listenerSubscription });
      listenerSubscription.remove();
      console.log("BLE listener removed");
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     // 🔹 Always watch Bluetooth state
  //     let subscription: { remove: () => void } | undefined;

  //     const blutoothWatcher = bleManager.onStateChange(async (state) => {
  //       console.log("Bluetooth state:", state);

  //       if (state === State.PoweredOn) {
  //         // 🔹 Only subscribe if we have a device AND Bluetooth is ON
  //         if (bleDevice?.id && !subscription) {
  //           subscription = responseListener();
  //           console.log("responseListener subscription applied >>>>>>", subscription);
  //         } else {
  //           console.log("Skipping responseListener, conditions not met", {
  //             globalDeviceId: bleDevice?.id,
  //             subscription,
  //           });
  //         }
  //         console.log("blue on >>>>")
  //         // setIsbluetoothOn(true);
  //       }

  //       if (state === State.PoweredOff) {
  //         bleCleanUp(undefined, subscription);
  //         subscription = undefined;
  //         console.log("blue off >>>>");
  //         setIsBluetoothPopupOpen(true);
  //         setShouldGoBack(true);
  //       }
  //     }, true); // true = run immediately with current state

  //     return () => {
  //       bleCleanUp(blutoothWatcher, subscription);
  //     };
  //   }, [bleDevice?.id])
  // );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWifiList();
  }, [loadWifiList]);

  const handleWifiAction = async (
    ssid: string,
    action: 'connect' | 'disconnect' | 'forget',
  ) => {

    try {

      let argAction: 'add' | 'sub' | 'del';

      switch (action) {
        case 'connect':
          argAction = 'add';
          break;

        case 'disconnect':
          argAction = 'sub';
          break;

        case 'forget':
          argAction = 'del';
          break;
      }

      if (!argAction) {
        console.log('invalid arg action');
        return;
      }

      await sendWifiAction(bleManager, deviceId, ssid, argAction);
    } catch (error: any) {
      console.log("error in handleWifiAction >>>", error.message)
    }

  };

  const showWifiMenu = (wifi: WifiNetwork) => {
    setMenuForWifi(wifi);
  };

  const { connectedWifi, savedWifi, otherWifi } = useMemo(() => {
    return {
      connectedWifi: wifiList.filter(e => e.u === 1),
      savedWifi: wifiList.filter(e => e.sav === 1 && e.u !== 1),
      otherWifi: wifiList.filter(e => e.sav === 0 && e.u !== 1),
    };
  }, [wifiList]);

  const resetStates = () => {
    setSelectedSsid(undefined);
    setMenuForWifi(undefined);
  };

  const renderWifiTile = (wifi: WifiNetworkWithId) => {
    const ssid = wifi.s ?? 'Unknown SSID';
    const isConnected = wifi.u === 1;
    const isSaved = wifi.sav === 1;
    const locked = wifi.lck === 1;

    return (
      <TouchableOpacity
        key={wifi.id}
        style={styles.tile}
        onPress={() => {
          if (isConnected) return;

          if (!isSaved) {
            console.log("wifi dialog >>>");
            setSelectedSsid(ssid);
            return;
          }

          if (isSaved && !isOverAllLoaing) {
            console.log({ isSaved, isOverAllLoaing });
            handleWifiAction(ssid, 'connect');
            return;
          }
        }}>
        <View style={styles.row}>
          <MaterialIcons
            name={getWifiIcon(wifi.sr)}
            size={24}
            color={theme.colors.onSurface}
          />
          {locked && (
            <MaterialIcons
              name="lock"
              size={10}
              color={theme.colors.onSurface}
              style={{ marginLeft: -10, marginTop: 14 }}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.ssid, { color: theme.colors.onSurface }]}>
              {ssid}
            </Text>
            {isConnected && (
              <Text
                style={[
                  styles.connected,
                  { color: theme.colors.onPrimaryContainer },
                ]}>
                Connected
              </Text>
            )}
          </View>
          {(isSaved || isConnected) && (
            <TouchableOpacity onPress={() => showWifiMenu(wifi)} disabled={isOverAllLoaing || isBluetoothConnectionError}>
              <MaterialIcons
                name="more-vert"
                size={22}
                color={isOverAllLoaing ? 'grey' : theme.colors.onSurface}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      {isOverAllLoaing && (
        <ProgressBar
          indeterminate
          color={theme.colors.primary}
          style={styles.loader}
        />
      )}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.content}>
        {connectedWifi.length > 0 && (
          <View style={styles.section}>
            {connectedWifi.map(renderWifiTile)}
          </View>
        )}

        {savedWifi.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Saved Networks</Text>
              {savedWifi.map(renderWifiTile)}
            </View>
          </>
        )}

        {otherWifi.length > 0 && (
          <>
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionHeader}>Available Networks</Text>
              {otherWifi.map(renderWifiTile)}
            </View>
          </>
        )}

        <WifiCredsDialog
          isLoading={isOverAllLoaing}
          visible={!!selectedSsid}
          ssid={selectedSsid}
          onDismiss={resetStates}
          deviceId={deviceId}
        />

        <CommonDialog
          visible={isBluetoothConnectionError}
          onDismiss={() => {
            if (isBluetoothConnectionError) {
              return;
            }
          }}
          icon='alert'
          title="Bluetooth required"
          TitleTextStyle={{textAlign:"center"}}
          bodyText="Your Bluetooth is currently turned off. Please enable it to connect to your device."
          bodyTextStyle={{textAlign:"center"}}
          showCancel={false}
        />

        <CommonDialog
          visible={isPermissionPopUpOpen}
          onDismiss={() => setIsPermissionPopUpOpen(false)}
          onCancel={() => setIsPermissionPopUpOpen(false)}
          title="Permission required"
          bodyText="Please enable Nearby Devices and Location permissions in Settings."
          okText="Open Settings"
          onOk={() => Linking.openSettings()}
          cancelText="Cancel"
        />


        <CommonModal
          isVisible={!!menuForWifi}
          onClose={resetStates}
          modalStyle={{ justifyContent: 'flex-end', margin: 0 }}
          containerStyle={{
            backgroundColor: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            paddingVertical: 10,
          }}>
          {menuOptions.map(option => (
            <TouchableOpacity
              key={option}
              style={{
                paddingVertical: 14,
                alignItems: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: '#eee',
              }}
              onPress={() => {
                if (!menuForWifi?.s) return;

                handleWifiAction(
                  menuForWifi.s,
                  option.toLowerCase() as 'connect' | 'disconnect' | 'forget',
                );

                resetStates();
              }}>
              <Text style={{ fontSize: 16 }}>{option}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={{ paddingVertical: 14, alignItems: 'center' }}
            onPress={resetStates}>
            <Text style={{ fontSize: 16, color: 'red' }}>Cancel</Text>
          </TouchableOpacity>
        </CommonModal>

        {/* <Button
        mode="contained"
        onPress={()=>setWifiLoading(true)}
      >
        on Loading
      </Button>
        
        <Button
        mode="contained"
        onPress={()=>setWifiLoading(false)}
      >
        off loading
      </Button> */}

      </ScrollView>
    </View>
  );
};

const getWifiIcon = (
  strength: number,
): 'wifi' | 'wifi-2-bar' | 'wifi-1-bar' | 'wifi-off' => {
  if (strength >= 75) return 'wifi';
  if (strength >= 50) return 'wifi-2-bar';
  if (strength >= 25) return 'wifi-1-bar';
  return 'wifi-off';
};

const styles = StyleSheet.create({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    ...commonStyles.container,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tile: {
    paddingVertical: 10,
  },
  section: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingVertical: 5,
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  ssid: {
    fontSize: 16,
  },
  connected: {
    fontSize: 12,
    color: 'blue',
  },
  sectionHeader: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '500',
    color: 'gray',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 27,
  },
  header: {
    marginBottom: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 12,
  },
  body: {
    // backgroundColor:"yellow"
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
});

export default WifiListWidget;
