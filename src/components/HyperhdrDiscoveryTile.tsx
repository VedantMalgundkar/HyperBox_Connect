import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from "react-native";

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

const HyperhdrDiscoveryTile: React.FC<Props> = ({ device, onConnect }) =>  {
  let displayName = device.name.substring(device.name.lastIndexOf(" on ") + 4).trim();
  displayName = displayName.split("-")[0];

  const [name, setName] = useState(displayName.trim() || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [res,setRes] = useState('');

  // randomize connected state on mount
  useEffect(() => {
    const random = Math.random() > 0.5;
    // setIsSelected(random);
  }, []);

  return (
    <View style={[styles.container, isSelected && styles.selected]}>
      <View style={styles.tile}>
        {isEditing ? (
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoFocus
            onSubmitEditing={() => setIsEditing(false)}
          />
        ) : (
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        )}

        {isSelected ? (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={isEditing ? () => setIsEditing(false) : () => setIsEditing(true)}
            >
              <Text style={styles.icon}>{isEditing ? "✔" : "✎"}</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Text style={styles.icon}>✖</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => {
                const selectedDevice = {
                ...device,
                ...(device.host && device.port && {
                  customBackendUrl: `http://${device.host}:${device.port}`,
                }),
                ...(device.host && {
                  hyperHdrUrl: `http://${device.host}:8090`,
                }),
              };

              console.log("selected device >>>> ", selectedDevice);
              if(selectedDevice?.customBackendUrl){
                onConnect(selectedDevice.customBackendUrl);
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
      <Text>{res}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: "#fffbff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  selected: {
    borderWidth: 1,
    borderColor: "#6200EE",
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
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
    top: 0,
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
