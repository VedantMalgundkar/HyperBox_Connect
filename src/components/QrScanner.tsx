import { useCallback, useState, useRef, useEffect } from "react"
import { StyleSheet, View, TouchableOpacity, Vibration, Linking } from "react-native"
import { useCameraDevice, useCodeScanner, useCameraPermission } from "react-native-vision-camera"
import { Camera } from "react-native-vision-camera"
import { CONTENT_SPACING, CONTROL_BUTTON_SIZE, SAFE_AREA_PADDING } from "./Constants"
import { useIsForeground } from "../hooks/useIsForeground"
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons"
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useIsFocused } from "@react-navigation/core"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import QrIcon from "../icons/QrIcon"
import { showPermissionPopup } from "../utils/permissions"
import { useTheme } from "react-native-paper"

type Props = {
  onScanned: (value: string) => Promise<boolean>;
};

export default function QrScanner({ onScanned }: Props): React.ReactElement {
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice("back")
  const isFocused = useIsFocused()
  const isForeground = useIsForeground()
  const isActive = isFocused && isForeground
  const [torch, setTorch] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const theme = useTheme();


  const closeCamera = ()=>{
    setShowCamera(false)
  }

  const onCodeScanned = useCallback(
    async (codes: { value?: string }[]) => {
      const value = codes[0]?.value;
      if (!value) return;

      Vibration.vibrate(1000);

      // Wait for onScanned to finish and check result
      const result = await onScanned(value);

      if (result) {
        closeCamera();
      }
    },
    [onScanned]
  );

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned,
  })

  // Show only QR icon until clicked
  if (!showCamera) {
    return (
      <View style={[styles.container, { backgroundColor:theme.colors.surfaceVariant }, { justifyContent: "center", alignItems: "center" }]}>
        <TouchableOpacity
          onPress={async () => {
            if (!hasPermission) {
              await requestPermission()
            }
            setShowCamera(true)
          }}
        >
          {/* <QrIcon size={150} color="white" /> */}
          <MaterialIcons name="qr-code-scanner" color={theme.colors.onSurfaceVariant} size={180} />
        </TouchableOpacity>
      </View>
    )
  }

  // If permission denied → show fallback UI
  if (!hasPermission) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <TouchableOpacity
          onPress={async () => {
            console.log("ran cam off >>>")
            const granted = await requestPermission()
            if (granted) {
              setShowCamera(true)
            } else {
              // show popup instead of opening settings directly
              showPermissionPopup(
                "Permission required",
                "Please enable camera permission in Settings.",
                () => Linking.openSettings(),
                "Open Settings"
              )
            }
          }}
        >
          <MaterialDesignIcons name="camera-off" color="white" size={50} />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
          torch={torch ? "on" : "off"}
          enableZoomGesture
        />
      )}

      <View style={styles.rightButtonRow}>
        <TouchableOpacity style={styles.button} onPress={() => setTorch(!torch)}>
          <MaterialDesignIcons name={torch ? "flash" : "flash-off"} color="white" size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={closeCamera}>
        <MaterialDesignIcons name="cancel" color="white" size={35} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: hp("28%"),
    width: wp("62%"),
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: "rgba(140, 140, 140, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  rightButtonRow: {
    position: "absolute",
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  backButton: {
    position: "absolute",
    left: SAFE_AREA_PADDING.paddingLeft,
    top: SAFE_AREA_PADDING.paddingTop,
  },
})
