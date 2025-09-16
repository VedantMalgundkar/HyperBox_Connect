import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import {MaterialIcons} from '@react-native-vector-icons/material-icons';
import CommonModal from './CommonModal';
import {
  discoverAndReadWifi,
  sendWifiAction,
  writeCredentials,
  listenWifiStatus,
} from '../services/bleService';
import {WifiNetwork} from '../services/bleService';
import {useConnection} from '../api/ConnectionContext';
import Toast from 'react-native-toast-message';
import {useTheme} from 'react-native-paper';

type Props = {
  deviceId: string;
  isFetchApi: boolean;
  setWifiLoading: (loading: boolean) => void;
};

interface bleResponse {
  status: 'connecting' | 'success' | 'failed' | 'forgetting';
  message?: string;
  error?: string;
}

interface WifiNetworkWithId extends WifiNetwork {
  id: string;
}

const WifiListWidget: React.FC<Props> = ({deviceId, isFetchApi, setWifiLoading}) => {
  const [wifiList, setWifiList] = useState<WifiNetworkWithId[]>([]);

  const [refreshing, setRefreshing] = useState(false);

  const {bleDevice} = useConnection();

  console.log('WifiListWidget bleDeviceId >>', bleDevice?.id);

  // 🔑 For modal
  const [selectedSsid, setSelectedSsid] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const [menuForWifi, setMenuForWifi] = useState<WifiNetwork | null>();

  const {bleManager} = useConnection();
  const theme = useTheme();

  useEffect(() => {
    const init = async () => {
      setWifiLoading(true);
      try {
        if (isFetchApi) {
          console.log('Connect BLE device: ', deviceId);
        } else {
          console.log('Fetch MAC id for BLE...');
        }
      } catch (e) {
        console.warn('BLE/API init failed:', e);
      } finally {
        setWifiLoading(false);
      }
    };
    init();
    loadWifiList();
  }, []);

  const loadWifiList = useCallback(async () => {
    setWifiLoading(true);
    try {
      let result: WifiNetwork[] = [];
      if (isFetchApi) {
        console.log('Fetching via API...');
      } else {
        console.log('Fetching via BLE...');

        result = await discoverAndReadWifi(bleManager, deviceId);
//         result = [
//   {
//     s: "Home_Wifi",
//     sr: 45, // strong signal
//     lck: 1,  // locked
//     u: 1,    // currently connected
//     sav: 1,  // saved
//   },
//   {
//     s: "Vedant_5G",
//     sr: 60, // good signal
//     lck: 1,
//     u: 0,
//     sav: 1,
//   },
//   {
//     s: "Coffee_Shop_Free",
//     sr: 70, // average signal
//     lck: 0,  // open network
//     u: 0,
//     sav: 0,
//   },
//   {
//     s: "Office_Network",
//     sr: 80, // weaker signal
//     lck: 1,
//     u: 0,
//     sav: 1,
//   },
//   {
//     s: "Random_Hotspot",
//     sr: 90, // very weak
//     lck: 0,
//     u: 0,
//     sav: 0,
//   },
// ];

      
        console.log('ble res >>>>', result);
      }

      // setConnectedWifi(result.filter((e) => e.u === 1));
      // setSavedWifi(result.filter((e) => e.sav === 1 && e.u !== 1));
      // setOtherWifi(result.filter((e) => e.sav === 0 && e.u !== 1));

      setWifiList(
        result.map(wifi => ({
          ...wifi,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        })),
      );
    } catch (e) {
      console.error('Error loading Wi-Fi list:', e);
    } finally {
      setWifiLoading(false);
      setRefreshing(false);
    }
  }, [isFetchApi, deviceId]);

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
  
      const res = await sendWifiAction(bleManager, deviceId, ssid, argAction);
  
      console.log('action resp >>>>', res);
  
      // TODO: Implement BLE or API action here
      loadWifiList();
    } catch (error:any) {
      console.log("error in handleWifiAction >>>",error.message)      
    }
    
  };

  const handleWifiWriteCredentials = async (ssid: string, password: string) => {
    try {
      console.log({ssid, password});
      await writeCredentials(bleManager, deviceId, ssid, password);
      resetStates();
    } catch (error) {
      console.error('Error writting Wi-Fi creds:', error);
    }
  };

  const showWifiMenu = (wifi: WifiNetwork) => {
    setMenuForWifi(wifi);
  };

  const menuOptions = [
    ...(menuForWifi?.u === 1 ? ['Disconnect'] : ['Connect']),
    ...(menuForWifi?.sav === 1 ? ['Forget'] : []),
  ];

  const {connectedWifi, savedWifi, otherWifi} = useMemo(() => {
    return {
      connectedWifi: wifiList.filter(e => e.u === 1),
      savedWifi: wifiList.filter(e => e.sav === 1 && e.u !== 1),
      otherWifi: wifiList.filter(e => e.sav === 0 && e.u !== 1),
    };
  }, [wifiList]);

  const resetStates = () => {
    setSelectedSsid(null);
    setPassword('');
    setMenuForWifi(null);
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
          if (isSaved || !locked) {
            handleWifiAction(ssid, 'connect');
          } else {
            setSelectedSsid(ssid);
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
              style={{marginLeft: -10, marginTop: 14}}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={[styles.ssid, {color: theme.colors.onSurface}]}>
              {ssid}
            </Text>
            {isConnected && (
              <Text
                style={[
                  styles.connected,
                  {color: theme.colors.onPrimaryContainer},
                ]}>
                Connected
              </Text>
            )}
          </View>
          {(isSaved || isConnected) && (
            <TouchableOpacity onPress={() => showWifiMenu(wifi)}>
              <MaterialIcons
                name="more-vert"
                size={22}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const responseListener = () => {
    const handleRecievedData = (data: bleResponse) => {
      console.log('data received from ble >>', data);

      Toast.show({
        type: 'custom_snackbar', // success | error | info
        text1: data.message ? data.message : data.error,
        position: 'bottom',
        visibilityTime: 3000,
      });

      if (data.status === 'success') {
        loadWifiList();
      }
    };

    const handleError = (error: Error) => {
      console.log('error recieved from ble >>', error);
    };

    try {
      const subs = listenWifiStatus(
        bleManager,
        deviceId,
        handleRecievedData,
        handleError,
      );
  
      return subs;

    } catch(error:any) {
      console.log("listenWifiStatus error >>",error.message);
    }

  };

  useEffect(() => {
    // Start listening
    const subscription = responseListener();

    // Cleanup on unmount
    return () => {
      subscription?.remove();
      console.log('BLE listener removed');
    };
  }, [bleManager, deviceId]);

  return (
    <View style={{flex: 1}}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{padding: 10}}>
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

        {/* 🔑 Password Modal */}
        <CommonModal
          isVisible={!!selectedSsid}
          onClose={resetStates}
          modalStyle={{justifyContent: 'center', margin: 20}}
          containerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter Wi-Fi Password</Text>
          <Text style={styles.modalSubtitle}>{selectedSsid}</Text>

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: '#ccc'}]}
              onPress={resetStates}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: '#6200ee'}]}
              onPress={() => {
                if (selectedSsid) {
                  handleWifiWriteCredentials(selectedSsid, password);
                }
              }}>
              <Text style={{color: 'white'}}>Connect</Text>
            </TouchableOpacity>
          </View>
        </CommonModal>

        <CommonModal
          isVisible={!!menuForWifi}
          onClose={resetStates}
          modalStyle={{justifyContent: 'flex-end', margin: 0}}
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
              <Text style={{fontSize: 16}}>{option}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={{paddingVertical: 14, alignItems: 'center'}}
            onPress={resetStates}>
            <Text style={{fontSize: 16, color: 'red'}}>Cancel</Text>
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
    borderRadius: 8,
    padding: 16,
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
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
});

export default WifiListWidget;
