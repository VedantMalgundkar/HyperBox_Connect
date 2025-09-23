import React, { createContext, useContext, useState, ReactNode } from "react";
import { CommonDialog } from "../components/CommonDialog";
import { NetworkDiagram } from "../components/NetworkDiagram";
import { View } from "react-native";

type NetworkDialogContextType = {
  showErrorDialog: (message?: string) => void;
  hideDialog: () => void;
};

const NetworkDialogContext = createContext<NetworkDialogContextType | undefined>(undefined);

export const useNetworkDialog = () => {
  const ctx = useContext(NetworkDialogContext);
  if (!ctx) throw new Error("useNetworkDialog must be used within NetworkDialogProvider");
  return ctx;
};

type Props = { children: ReactNode };

export const NetworkDialogProvider: React.FC<Props> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bodyText, setBodyText] = useState<string>("");

  const showErrorDialog = (message?: string) => {
    setBodyText(
      message ??
        `Make sure your mobile, TV, and device are connected to the same Wi-Fi network.\n
Ensure the device is powered on.\n
Keep your device nearby for a stable connection.`
    );
    setIsVisible(true);
  };

  const hideDialog = () => {
    setIsVisible(false);
  };

  return (
    <NetworkDialogContext.Provider value={{ showErrorDialog, hideDialog }}>
      {children}

      <CommonDialog
        visible={isVisible}
        onDismiss={hideDialog}
        okText="Retry Connection"
        onOk={hideDialog}
        showCancel={false}
        title="Device Disconnected"
        bodyText={bodyText}
        bodyTextStyle={{ textAlign: "center" }}
        isChildrenFirstContent={true}
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
          <NetworkDiagram size={55} gap={20} />
        </View>
      </CommonDialog>
    </NetworkDialogContext.Provider>
  );
};
