import * as React from 'react'
import { useCallback, useRef, useState, useEffect } from 'react'
import type { AlertButton } from 'react-native'
import { Alert, Linking, StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import type { Code } from 'react-native-vision-camera'
import { useCameraDevice, useCodeScanner, useCameraPermission } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { CONTENT_SPACING, CONTROL_BUTTON_SIZE, SAFE_AREA_PADDING } from '../components/Constants'
import { useIsForeground } from '../hooks/useIsForeground'
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useIsFocused } from '@react-navigation/core'
import { RootStackParamList } from '../navigation'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import QrIcon from '../icons/QrIcon'

type CodeScannerPageNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'codeScanner'
>

const showCodeAlert = (value: string, onDismissed: () => void): void => {
  const buttons: AlertButton[] = [
    { text: 'Close', style: 'cancel', onPress: onDismissed },
  ]
  if (value.startsWith('http')) {
    buttons.push({
      text: 'Open URL',
      onPress: () => {
        Linking.openURL(value)
        onDismissed()
      },
    })
  }
  Alert.alert('Scanned Code', value, buttons)
}

export function CodeScannerPage(): React.ReactElement {
  const navigation = useNavigation<CodeScannerPageNavigationProp>()
  const { hasPermission, requestPermission } = useCameraPermission()
  const device = useCameraDevice('back')

  const isFocused = useIsFocused()
  const isForeground = useIsForeground()
  const isActive = isFocused && isForeground

  const [torch, setTorch] = useState(false)
  const isShowingAlert = useRef(false)
  const [showCamera, setShowCamera] = useState(false)

  const onCodeScanned = useCallback((codes: Code[]) => {
    const value = codes[0]?.value
    if (!value || isShowingAlert.current) return
    showCodeAlert(value, () => {
      isShowingAlert.current = false
    })
    isShowingAlert.current = true
  }, [])

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned,
  })

  // Show only QR icon until clicked
  if (!showCamera) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <TouchableOpacity
          onPress={async () => {
            if (!hasPermission) {
              await requestPermission()
            }
            setShowCamera(true)
          }}
        >
          <QrIcon size={150} color="white" />
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

      <TouchableOpacity style={styles.backButton} onPress={() => setShowCamera(false)}>
        <MaterialDesignIcons name="cancel" color="white" size={35} />
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    height: hp('30%'),
    width: wp('65%'),
    backgroundColor: 'grey',
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rightButtonRow: {
    position: 'absolute',
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  backButton: {
    position: 'absolute',
    left: SAFE_AREA_PADDING.paddingLeft,
    top: SAFE_AREA_PADDING.paddingTop,
  },
})
