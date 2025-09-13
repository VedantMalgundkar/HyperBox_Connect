import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { commonStyles } from "../styles/common";
import { useConnection } from "../api/ConnectionContext";
import { useSysApi } from "../api/sysApi";
import { useTheme } from "react-native-paper";

export interface HyperhdrDevice {
  name: string;
  host?: string;                // primary host (IPv4/IPv6)
  port?: number;
  customBackendUrl?: string;
  fullName?: string;            // e.g., "fe80::fa99:...._hyperhdr._tcp"
  addresses?: string[];         // all addresses reported by Zeroconf
  txt?: Record<string, any>;    // TXT record data
}

interface Props {
  device: HyperhdrDevice;
  onConnect: (id: string) => void;
  onDeviceNameUpdating?: (loadingState: boolean) => void;
}

const HyperhdrDiscoveryTile: React.FC<Props> = ({
  device,
  onConnect,
  onDeviceNameUpdating,
}) => {
  let displayName = device.name.substring(device.name.lastIndexOf(" on ") + 4).trim();
  displayName = displayName.split("-")[0];

  const inputRef = useRef<any>(null);

  const [tempName, setTempName] = useState(displayName.trim() || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { baseUrl } = useConnection();
  const { setHostname } = useSysApi();
  const theme = useTheme();

  const customBackendUrl = `http://${device.host}:${device.port}`;
  const isSelected = customBackendUrl === baseUrl;
  const host = isEditing ? null : `Host : ${device?.host}`

  const handleSave = async () => {
    if (tempName.trim()) {
      setIsLoading(true);
      onDeviceNameUpdating?.(true);
      try {
        await setHostname(tempName.trim());
      } catch (e) {
        console.error("Failed to update hostname:", e);
      } finally {
        setIsLoading(false);
        setIsEditing(false);
        onDeviceNameUpdating?.(false);
      }
    }
  };

  const renderActions = (props?: any) => {
    if (!isSelected) {
      return (
        <Button 
          mode="contained" 
          style={[commonStyles.bRadius]}
          compact={true}
          onPress={() => customBackendUrl && onConnect(customBackendUrl)}
          >
          Connect
        </Button>
        
      );
    }

    if (!isEditing) {
      return <IconButton icon="pencil" size={20} onPress={() => setIsEditing(true)} {...props} />;
    }

    if (!isLoading) {
      return (
        <View style={styles.actions}>
          <IconButton icon="check" size={20} onPress={handleSave} {...props} />
          <IconButton icon="close" size={20} onPress={() => setIsEditing(false)} {...props} />
        </View>
      );
    }

    // Loading state
    return (
      <View style={styles.actions}>
        <ActivityIndicator animating size="small" style={{ marginRight: 4 }} />
        <IconButton
          icon="close"
          size={20}
          onPress={() => setIsEditing(false)}
          disabled={isLoading}
          {...props}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.colors.primary }
      ]}
    >
      <View style={styles.row}>
        {/* Left side: title + subtitle */}
        <View style={styles.textContainer}>
          {isEditing ? (
            <TextInput
              ref={inputRef}
              value={tempName}
              onChangeText={setTempName}
              mode="flat"
              style={styles.input}
              onSubmitEditing={() => setIsEditing(false)}
            />
          ) : (
            <>
              <Text style={styles.title}>{tempName}</Text>
              {host && <Text style={styles.subtitle}>{host}</Text>}
            </>
          )}
        </View>

        {/* Right side: actions */}
        <View style={styles.actions}>{renderActions()}</View>
      </View>

      {isSelected && (
        <View
          style={[
            styles.chip,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Text style={{ color: theme.colors.onPrimaryContainer, fontSize: 9 }}>
            Connected
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.column,
    ...commonStyles.bRadius,
    position: "relative",
    minHeight: 75,
    justifyContent: "center",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2, // control gap to subtitle
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 16,
    width: "100%",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    position: "absolute",
    top: -10,
    right: 20,
    padding: 5,
    borderRadius: 6,
  },
});

export default HyperhdrDiscoveryTile;
