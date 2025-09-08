import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
} from "react-native";
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import CommonModal from "./CommonModal";

type WifiNetwork = {
  s: string; // SSID
  sr: number; // Signal strength
  lck: number; // Locked
  u: number; // Connected
  sav: number; // Saved
};

type Props = {
  deviceId: string;
  isFetchApi: boolean;
};

const WifiListWidget: React.FC<Props> = ({ deviceId, isFetchApi }) => {
  const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);

  const [loading, setLoading] = useState(false);
  const [writeLoading, setWriteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 🔑 For modal
  const [selectedSsid, setSelectedSsid] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const [menuForWifi, setMenuForWifi] = useState<WifiNetwork | null>();

  // Simulated BLE + API services
  const bleService = useRef<any>(null);
  const httpService = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      setWriteLoading(true);
      try {
        if (isFetchApi) {
          console.log("Connect BLE device: ", deviceId);
        } else {
          console.log("Fetch MAC id for BLE...");
        }
      } catch (e) {
        console.warn("BLE/API init failed:", e);
      } finally {
        setWriteLoading(false);
      }
    };
    init();
    loadWifiList();
  }, []);

  const loadWifiList = useCallback(async () => {
    setLoading(true);
    try {
      let result: WifiNetwork[] = [];
      if (isFetchApi) {
        console.log("Fetching via API...");
      } else {
        console.log("Fetching via BLE...");
        result = [
          { s: "TP-Link_8CCC", sr: 77, lck: 1, u: 1, sav: 1 },
          { s: "Airtel_123", sr: 65, lck: 1, u: 0, sav: 1 },
          { s: "Jio_123", sr: 50, lck: 1, u: 0, sav: 1 },
          { s: "Guest-WiFi", sr: 40, lck: 0, u: 0, sav: 0 },
          { s: "Test wifi", sr: 40, lck: 0, u: 0, sav: 0 },
          { s: "Test wifi12", sr: 60, lck: 1, u: 0, sav: 0 },
        ];
      }

      // setConnectedWifi(result.filter((e) => e.u === 1));
      // setSavedWifi(result.filter((e) => e.sav === 1 && e.u !== 1));
      // setOtherWifi(result.filter((e) => e.sav === 0 && e.u !== 1));

      setWifiList(result);
    } catch (e) {
      console.error("Error loading Wi-Fi list:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isFetchApi, deviceId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWifiList();
  }, [loadWifiList]);

  const handleWifiAction = (ssid: string, action: "connect" | "disconnect" | "forget", pwd?: string) => {
    Alert.alert(`Action`, `${action} ${ssid}${pwd ? ` with password ${pwd}` : ""}`);
    // TODO: Implement BLE or API action here
    loadWifiList();
  };

  const showWifiMenu = (wifi: WifiNetwork) => {
    setMenuForWifi(wifi);
  };

  const menuOptions = [
    ...(menuForWifi?.u === 1 ? ["Disconnect"] : ["Connect"]),
    ...(menuForWifi?.sav === 1 ? ["Forget"] : [])
  ];

  const { connectedWifi, savedWifi, otherWifi } = useMemo(() => {
    return {
      connectedWifi: wifiList.filter((e) => e.u === 1),
      savedWifi: wifiList.filter((e) => e.sav === 1 && e.u !== 1),
      otherWifi: wifiList.filter((e) => e.sav === 0 && e.u !== 1),
    };
  }, [wifiList]);


  const resetStates = () => {
    setSelectedSsid(null);
    setPassword("");
    setMenuForWifi(null);
  }

  const renderWifiTile = (wifi: WifiNetwork) => {
    const ssid = wifi.s ?? "Unknown SSID";
    const isConnected = wifi.u === 1;
    const isSaved = wifi.sav === 1;
    const locked = wifi.lck === 1;

    return (
      <TouchableOpacity
        key={ssid}
        style={styles.tile}
        onPress={() => {
          if (isConnected) return;
          if (isSaved || !locked) {
            handleWifiAction(ssid, "connect");
          } else {
            setSelectedSsid(ssid);
          }
        }}
      >
        <View style={styles.row}>
          <MaterialIcons name={getWifiIcon(wifi.sr)} size={24} color="black" />
          {locked && (
            <MaterialIcons
              name="lock"
              size={10}
              color="black"
              style={{ marginLeft: -10, marginTop: 14 }}
            />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.ssid}>{ssid}</Text>
            {isConnected && <Text style={styles.connected}>Connected</Text>}
          </View>
          {(isSaved || isConnected) && (
            <TouchableOpacity onPress={() => showWifiMenu(wifi)}>
              <MaterialIcons name="more-vert" size={22} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {writeLoading && (
        <ActivityIndicator size="small" color="blue" style={{ marginVertical: 4 }} />
      )}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 10 }}
      >
        <View style={styles.section}>{connectedWifi.map(renderWifiTile)}</View>

        <View style={styles.section}>
          {savedWifi.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Saved Networks</Text>
              {savedWifi.map(renderWifiTile)}
            </>
          )}
        </View>

        <View style={[styles.section, styles.lastSection]}>
          {otherWifi.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Available Networks</Text>
              {otherWifi.map(renderWifiTile)}
            </>
          )}
        </View>

        {/* 🔑 Password Modal */}
        <CommonModal
          isVisible={!!selectedSsid}
          onClose={resetStates}
          modalStyle={{ justifyContent: "center", margin: 20 }}
          containerStyle={styles.modalContainer}
        >
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
              style={[styles.actionBtn, { backgroundColor: "#ccc" }]}
              onPress={resetStates}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#6200ee" }]}
              onPress={() => {
                if (selectedSsid) {
                  handleWifiAction(selectedSsid, "connect", password);
                  resetStates();
                }
              }}
            >
              <Text style={{ color: "white" }}>Connect</Text>
            </TouchableOpacity>
          </View>
        </CommonModal>

        <CommonModal
          isVisible={!!menuForWifi}
          onClose={resetStates}
          modalStyle={{ justifyContent: "flex-end", margin: 0 }}
          containerStyle={{
            backgroundColor: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            paddingVertical: 10,
          }}
        >
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={{
                paddingVertical: 14,
                alignItems: "center",
                borderBottomWidth: 0.5,
                borderBottomColor: "#eee",
              }}
              onPress={() => {
                if (!menuForWifi?.s) return;

                handleWifiAction(
                  menuForWifi.s,
                  option.toLowerCase() as "connect" | "disconnect" | "forget"
                );

                resetStates();
              }}
            >
              <Text style={{ fontSize: 16 }}>{option}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={{ paddingVertical: 14, alignItems: "center" }}
            onPress={resetStates}
          >
            <Text style={{ fontSize: 16, color: "red" }}>Cancel</Text>
          </TouchableOpacity>
        </CommonModal>

        {loading && (
          <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
        )}
      </ScrollView>
    </View>
  );
};

const getWifiIcon = (
  strength: number
): "wifi" | "wifi-2-bar" | "wifi-1-bar" | "wifi-off" => {
  if (strength >= 75) return "wifi";
  if (strength >= 50) return "wifi-2-bar";
  if (strength >= 25) return "wifi-1-bar";
  return "wifi-off";
};

const styles = StyleSheet.create({
  tile: {
    paddingVertical: 10,
  },
  section: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
  },
  lastSection: {
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "blue",
  },
  sectionHeader: {
    marginTop: 15,
    marginBottom: 3,
    fontSize: 14,
    fontWeight: "500",
    color: "gray",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
});

export default WifiListWidget;
