import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useConnection } from "../api/ConnectionContext";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { commonStyles } from "../styles/common";
import CommonModal from "./CommonModal";
import { useSysApi } from "../api/sysApi";

export interface HyperhdrDevice {
  name: string;
  fullName?: string;
  host?: string;
  addresses?: string[];
  port?: number;
  txt?: Record<string, any>;
  type?: string;
  protocol?: string;
  domain?: string;
  customBackendUrl?: string;
  hyperHdrUrl?: string;
}

interface Props {
  device: HyperhdrDevice;
  onConnect: (id: string) => void;
}

const HyperhdrDiscoveryTile: React.FC<Props> = ({ device, onConnect }) => {
  let displayName = device.name.substring(device.name.lastIndexOf(" on ") + 4).trim();
  displayName = displayName.split("-")[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempName, setTempName] = useState(displayName.trim());
  const [isLoading, setIsLoading] = useState(false);

  const { baseUrl } = useConnection();
  const customBackendUrl = `http://${device.host}:${device.port}`;
  const isSelected = customBackendUrl === baseUrl;

  const { setHostname } = useSysApi();

  const closeEditModal = () => {
    setIsModalOpen(false);
  }

  const handleSave = async () => {
    if (tempName.trim()) {
      await updateHostName(tempName.trim());
    }
  };

  const updateHostName = async (hostname: string) => {
    setIsLoading(true);
    try {
      await setHostname(hostname);
      // await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (e) {
      console.error("Failed to update hostname:", e);
    } finally {
      setIsLoading(false);
      closeEditModal();
    }
  };

  return (
    <View style={[styles.container, commonStyles.card, isSelected && styles.selected]}>
      <View style={styles.tile}>
        <View>
          <Text style={styles.name} numberOfLines={1}>
            {displayName.trim()}
          </Text>
          <Text style={styles.host} numberOfLines={1}>
            Host: {device.host}
          </Text>
        </View>

        {isSelected ? (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setIsModalOpen(true)}>
              <MaterialDesignIcons name="pencil" size={25} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => {
              if (customBackendUrl) {
                onConnect(customBackendUrl);
              }
            }}
          >
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSelected && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Connected</Text>
        </View>
      )}

      <CommonModal
        isVisible={isModalOpen}
        onClose={()=>{
          if(!isLoading){
            console.log("isLoading >>>>",isLoading);
            closeEditModal()
          }
        }}
        modalStyle={{ justifyContent: "space-around", margin: 30 }}
        containerStyle={{
          backgroundColor: "white",
          borderRadius: 16,
          padding: 15,
        }
        }
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver={true}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Device Name</Text>

          <TextInput
            value={tempName}
            onChangeText={setTempName}
            style={styles.input}
            placeholder="Enter new name"
            autoFocus
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={closeEditModal}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.okButton, isLoading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>OK</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </CommonModal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.column,
    borderRadius: 12,
    position: "relative",
    minHeight: 62,
    justifyContent: "center",
  },
  selected: {
    borderWidth: 1,
    borderColor: "#6200EE",
  },
  tile: {
    ...commonStyles.row,
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  host: {
    fontSize: 10,
  },
  // input: {
  //   borderBottomWidth: 1,
  //   borderColor: "#aaa",
  //   paddingVertical: 6,
  //   fontSize: 16,
  //   marginTop: 10,
  // },
  actions: {
    ...commonStyles.row,
    gap: 8,
  },
  connectBtn: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  connectText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: 12,
    backgroundColor: "#6200EE",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,

    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: "#ccc",
  },
  okButton: {
    backgroundColor: "#6200EE",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default HyperhdrDiscoveryTile;
