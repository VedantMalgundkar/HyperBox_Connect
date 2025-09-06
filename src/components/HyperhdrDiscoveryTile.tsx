import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { useConnection } from "../api/ConnectionContext";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { commonStyles } from "../styles/common";
import { useSysApi } from "../api/sysApi";
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

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
  onEdit: (ref?: any) => void; 
  onDeviceNameUpdating?: (loadingState: boolean) => void;
}

const HyperhdrDiscoveryTile: React.FC<Props> = ({ device, onConnect, onEdit, onDeviceNameUpdating }) =>  {
  let displayName = device.name.substring(device.name.lastIndexOf(" on ") + 4).trim();
  displayName = displayName.split("-")[0];
  const inputRef = useRef<TextInput>(null);

  const [tempName, setTempName] = useState(displayName.trim() || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { baseUrl } = useConnection();

  const customBackendUrl =  `http://${device.host}:${device.port}`

  const isSelected = customBackendUrl == baseUrl;

  const { setHostname } = useSysApi();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const timer = setTimeout(() => {
        onEdit?.(inputRef.current);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (tempName.trim()) {
      await updateHostName(tempName.trim());
    }
  };

  const updateHostName = async (hostname: string) => {
    setIsLoading(true);
    if(onDeviceNameUpdating){
      onDeviceNameUpdating(true);
    }
    try {
      await setHostname(hostname);
      // await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (e) {
      console.error("Failed to update hostname:", e);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
      if(onDeviceNameUpdating){
        onDeviceNameUpdating(false);
      }
    }
  };

  return (
    <View style={[styles.container, commonStyles.card, isSelected && styles.selected]}>
      <View style={styles.tile}>
        {isEditing ? (
          <TextInput
            ref={inputRef}
            value={tempName}
            onChangeText={setTempName}
            style={styles.input}
            autoFocus
            onSubmitEditing={() => setIsEditing(false)}
          />
        ) : (
          <View>
            <Text style={styles.name} numberOfLines={1}>
              {tempName}
            </Text>
            <Text style={styles.host} numberOfLines={1}>
              Host: {device.host}
            </Text>
          </View>
        )}

        {isSelected ? (
          <View style={styles.actions}>
            {isEditing ? (
              <>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#6200EE" style={{ marginRight: wp('1%') }} />
                ) : (
                  <TouchableOpacity onPress={handleSave}>
                    <MaterialDesignIcons name="check" size={25} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity disabled={isLoading} onPress={() => setIsEditing(false)}>
                  <MaterialDesignIcons name="close" size={25} />
                </TouchableOpacity>
              </>
              
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <MaterialDesignIcons name="pencil" size={25} />
              </TouchableOpacity>
            )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.column,
    borderRadius: 12,
    position: "relative",
    minHeight:62,
    justifyContent:"center",
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
    fontSize:10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 2,
  },
  actions: {
    ...commonStyles.row,
    gap: 8,
    paddingLeft: 8,
  },
  icon: {
    fontSize: 18,
    marginHorizontal: 6,
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
});

export default HyperhdrDiscoveryTile;
