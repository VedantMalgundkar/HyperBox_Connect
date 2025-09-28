import React, { useState } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useNetworkDialog } from "../api/NetworkDialogContext";
import { useTheme, Button } from "react-native-paper";

type WebViewComponentProps = {
  url: string;
};

const WebViewComponent: React.FC<WebViewComponentProps> = ({ url }) => {
  const { showErrorDialog } = useNetworkDialog();
  const theme = useTheme();
  const [hasError, setHasError] = useState(false);
  const [retry, setRetry] = useState(false); 

  const handleRetry = () => {
    setRetry((priv)=>!priv)
  }

  if (hasError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, marginBottom: 12 }}>
          Something went wrong loading the page.
        </Text>
        <Button
          mode="contained"
          onPress={() => handleRetry()}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <WebView
      key={Number(retry)}
      source={{ uri: url }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      style={{ flex: 1 }}
      onError={() => {
        setHasError(true);
        showErrorDialog();
      }}
    />
  );
};

export default WebViewComponent;
