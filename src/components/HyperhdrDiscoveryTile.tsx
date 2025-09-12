import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Text,
  TextInput,
  IconButton,
  Button,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { commonStyles } from "../styles/common";
import { useConnection } from "../api/ConnectionContext";
import { useSysApi } from "../api/sysApi";
import { useTheme } from "react-native-paper";

export interface HyperhdrDevice {
  name: string;
  host?: string;
  port?: number;
  customBackendUrl?: string;
}

interface Props {
  device: HyperhdrDevice;
  onConnect: (id: string) => void;
  onEdit: (ref?: any) => void;
  onDeviceNameUpdating?: (loadingState: boolean) => void;
}

const HyperhdrDiscoveryTile: React.FC<Props> = ({
  device,
  onConnect,
  onEdit,
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const timer = setTimeout(() => onEdit?.(inputRef.current), 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

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
        <Button mode="contained" onPress={() => customBackendUrl && onConnect(customBackendUrl)}>
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

  const renderTitle = () => {
    if (isEditing) {
      return (
        <TextInput
          ref={inputRef}
          value={tempName}
          onChangeText={setTempName}
          mode="flat"
          style={styles.input}
          onSubmitEditing={() => setIsEditing(false)}
        />
      );
    } else {
      return tempName;
    }
  };

  return (
    <Card
      style={[
        styles.container,
        isSelected && { borderWidth: 1, borderColor: theme.colors.primary },
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
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.column,
    borderRadius: 12,
    position: "relative",
    minHeight: 62,
    justifyContent: "center",
    marginVertical: 4,
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
