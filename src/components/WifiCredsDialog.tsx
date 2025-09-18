import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { CommonDialog } from "./CommonDialog";
import { writeCredentials } from "../services/bleService";
import { useConnection } from "../api/ConnectionContext";

type WifiCredsDialogProps = {
  visible: boolean;
  ssid?: string;
  onDismiss: () => void;
  deviceId: string;
};

export const WifiCredsDialog: React.FC<WifiCredsDialogProps> = ({
  visible,
  ssid,
  onDismiss,
  deviceId,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { bleManager } = useConnection();

  const handleWifiWriteCredentials = async (ssid: string, password: string) => {
    try {
      console.log("handleWifiWriteCredentials >>", { ssid, password, deviceId });
      await writeCredentials(bleManager, deviceId, ssid, password);
      setPassword("");
      onDismiss();
    } catch (error) {
      console.error("Error writing Wi-Fi creds:", error);
    }
  };

  return (
    <CommonDialog
      visible={visible}
      title="Enter Wi-Fi Password"
      subtitle={ssid}
      onDismiss={onDismiss}
      okText="Connect"
      onOk={() => {
        if (ssid) {
          handleWifiWriteCredentials(ssid, password);
        }
      }}
    >
      <TextInput
        mode="flat"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (ssid) {
            handleWifiWriteCredentials(ssid, password);
          }
        }}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
    </CommonDialog>
  );
};
