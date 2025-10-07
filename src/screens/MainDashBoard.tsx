import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BrightnessSlider from "../components/BrightnessSlider";
import EffectTileContainer from "../components/EffectsContainer/EffectsContainer";
import InputSourceDashBoard from "../components/InputSourceDashBoard";
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { Button, SafeAreaView, ScrollView, TouchableOpacity, View, Text, Dimensions } from "react-native";
import CustomColorPicker from "../components/CustomColorPicker/CustomColorPicker";
import { commonStyles } from "../styles/common";

import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import Modal from "react-native-modal";
import HyperhdrScannerContent from '../components/HyperhdrScannerContent';
import CommonModal from '../components/CommonModal';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { RootStackParamList } from '../navigation';
import { useTheme, Appbar } from "react-native-paper";
import { useSysApi } from '../api/sysApi';
import { useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { RootDrawerParamList } from '../navigation';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Priority } from '../types/wsTypes';
import { CommonDialog } from '../components/CommonDialog';
import { useConnection } from '../api/ConnectionContext';
import { Text as PaperText } from "react-native-paper";
import { GrabberInstructions } from '../components/GrabberInstructions';
import { PaperTextInput } from '../components/common/PaperTextInput';
import { setHyperHdrPassword } from '../services/storage/regularStorage';
import { useToast } from '../api/ToastProvider';
import WifiIconButton from '../components/WifiIconButton';
// type Props = NativeStackScreenProps<RootStackParamList, 'MainDashBoard'>;
// type MainDashBoardDrawerProp = DrawerNavigationProp<RootDrawerParamList, 'MainDashBoard'>;

type MainDashBoardNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<RootDrawerParamList, "MainDashBoard">,
  NativeStackNavigationProp<RootStackParamList>
>;

const MainDashBoard = () => {
  const navigation = useNavigation<MainDashBoardNavigationProp>();
  const [hasCleared, setHasCleared] = useState<boolean>(false);
  const [isChangeDeviceDrawerOpen, setIsChangeDeviceDrawerOpen] = useState(false);
  const [isDeviceNameUpdating, setDeviceNameUpdating] = useState(false);
  const [isHdmiOn, setHdmiOn] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<Priority | null>(null);
  const [protoPort, setProtoPort] = useState<number | undefined>();
  const [isUnauthorizedError, SetIsUnauthorizedError] = useState<boolean>(false);
  const hyperHdrPassword = useRef<string>("");
  
  const isHdmiOverridden = currentInput ? (!["PROTOSERVER", "VIDEOGRABBER"].includes(currentInput.componentId) && isHdmiOn)  : false
  
  const [hasUserAgreedToOverrideHdmiPermenent, setHasUserAgreedToOverrideHdmiPermenent] = useState<boolean>(false);

  const [showOverridePopup, setShowOverridePopup] = useState<boolean>(false);

  const [isGrabberPopUpOpen, setIsGrabberPopupOpen] = useState<boolean>(false);
  const { baseUrl } = useConnection();
  
  const pendingActionRef = useRef<null | (() => void)>(null);
  const hyperHdrLogin = useRef<null | ((password: string) => void)>(null);

  const showToast = useToast();

  const isGrabberRunning = currentInput?.componentId == "PROTOSERVER";

  let overRideTitle = "Override HDMI input?"
  let overRideBodyText = "This action will change your current HDMI active LED input. Do you want to continue?"
  
  if (isGrabberRunning) {
    overRideTitle = "Grabber is Running"
    overRideBodyText = "You can’t override LED input while the Hyperion grabber is running. Please stop the grabber before continuing."
  }

  const closeOverridePopup = () => {
    setShowOverridePopup(false)
  }

  const isItOkayToCallApi = (action: () => void) => {
    if (!isHdmiOn || hasUserAgreedToOverrideHdmiPermenent) {
      return true; // safe to run immediately
    }

    // Store the action for later execution (doesn't trigger re-render)
    pendingActionRef.current = action;
    setShowOverridePopup(true);
    return false;
  };

  const handleHyperHdrPasswordChange = (newPassword: string) => {
    hyperHdrPassword.current = newPassword;
  }

  const handleLoginSuccess = () => {
    if(hyperHdrPassword?.current) {
      setHyperHdrPassword(hyperHdrPassword.current.trim())
    }
  }
  
  const getHyperHdrLoginFromChild = (action: (password: string) => void) => {
    hyperHdrLogin.current = action;
  };

  const theme = useTheme(); // Paper theme

  const handleWifiIconRedirect = (mac : string) => {
    navigation.navigate("WifiScanner",{deviceId: mac, isBluetoothConnected: false})
  }

  const handleHdmiInputChnage = (value:boolean) => {
    setHdmiOn(value);
  }

  const openDrawer = () => {
    setIsChangeDeviceDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (!isDeviceNameUpdating) {
      setIsChangeDeviceDrawerOpen(false);
    }
  }; 

  const handleOverPopUpActions = () => {
    setShowOverridePopup(false);
    if (pendingActionRef.current) {
      pendingActionRef.current(); // run saved API call
      pendingActionRef.current = null;
    }
  }

  const handleProtoPortChange = (port: number) => {
    setProtoPort(port);
    SetIsUnauthorizedError(false);
  }

  const showPasswordInput = () => {
    SetIsUnauthorizedError(true);
  }

  const handlePasswordSubmit = () => {
    if (hyperHdrPassword.current && hyperHdrPassword.current.length < 8) {
      showToast({ message: "Min 8 characters required", duration: 3000 });
      return;
    }
    
    if (hyperHdrLogin.current) {
      hyperHdrLogin.current(hyperHdrPassword.current);
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
          {/* Hamburger menu icon */}
        <Appbar.Action
          icon="menu"
          color={theme.colors.onPrimary}
          onPress={() => navigation.toggleDrawer()}
        />

          {/* Title */}
          <Appbar.Content
            title="Light Studio"
            titleStyle={{ color: theme.colors.onPrimary }}
          />

          {/* Change Device Button */}
          <View
            onTouchEnd={openDrawer}
            style={[
              commonStyles.row,
              {
                gap: 4,
                backgroundColor: theme.colors.surfaceVariant,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 30,
                marginRight: 8,
              },
            ]}
          >
            <MaterialIcons
              name="sync-alt"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                fontSize: 9,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Change Device
            </Text>
          </View>

          {/* Wifi Icon + SSID */}
          <WifiIconButton key={Number(isChangeDeviceDrawerOpen)} onPress={handleWifiIconRedirect}/>
        </Appbar.Header>
      ),
    });
  }, [navigation, theme, isChangeDeviceDrawerOpen]);

  

  return (
    <SafeAreaView style={[commonStyles.container, {backgroundColor:theme.colors.surface}]}>
      <View style={{ flex: 1 }}>

        <CommonModal
          isVisible={isChangeDeviceDrawerOpen}
          onClose={closeDrawer}
          containerStyle={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: hp('50%'),
            padding: 10,
          }
          }
          modalStyle={{ justifyContent: "flex-end", margin: 0 }}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          animationInTiming={300}
          animationOutTiming={300}
          useNativeDriver={true}
        >
          <HyperhdrScannerContent onConnect={closeDrawer} onDeviceNameUpdating={(loadingState) => setDeviceNameUpdating(loadingState)} />
        </CommonModal>
      </View>


      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {/* <Button title="Go Back" onPress={() => openDrawer()} /> */}
        <BrightnessSlider />
        {/* <InputSourceDashBoard currentInput={currentInput} setCurrentInput={setCurrentInput} isHdmiOn={isHdmiOn} onHdmiInputChange={handleHdmiInputChnage} onHdmiOverride={handleHdmiOverride}/> */}
        <InputSourceDashBoard onLoginSuccess={handleLoginSuccess} getHyperHdrLogin={getHyperHdrLoginFromChild} onUnAuthError={showPasswordInput} onProtoPortChange={handleProtoPortChange} onGrabberAboutClick={()=>setIsGrabberPopupOpen(true)} currentInput={currentInput} setCurrentInput={setCurrentInput} onHdmiInputChange={handleHdmiInputChnage}/>
        <CustomColorPicker isItOkayToCallApi={isItOkayToCallApi} isHdmiOverriden={isHdmiOverridden} onColorClearOrChange={() => setHasCleared((prev) => !prev)} />
        <EffectTileContainer isItOkayToCallApi={isItOkayToCallApi} hasCleared={hasCleared} />
      </ScrollView>

      <CommonDialog
        visible={showOverridePopup}
        title={overRideTitle}
        bodyText={overRideBodyText}
        okText={isGrabberRunning ? "Ok" : "Yes"}
        cancelText="Yes don't ask again"
        onDismiss={closeOverridePopup}
        onOk={isGrabberRunning ? closeOverridePopup : handleOverPopUpActions}
        onCancel={() => {
          setHasUserAgreedToOverrideHdmiPermenent(true);
          handleOverPopUpActions();
        }}
        showCancel={isGrabberRunning? false: true}
      />

      <CommonDialog
        visible={isGrabberPopUpOpen}
        onDismiss={() => setIsGrabberPopupOpen(false)}
        title={isUnauthorizedError? "Enter WebUI password" : "Connect To TV"}
        subtitle={isUnauthorizedError? "Enter your HyperHDR WebUI password \n(it may have changed)." : undefined}
        showCancel={false}
        onOk={isUnauthorizedError? handlePasswordSubmit : undefined}
        okText='Login'
      >
          {isUnauthorizedError ? (
            <View style={{paddingTop: 7}}>       
              <PaperTextInput
                mode="flat"
                label="Password"
                defaultValue={hyperHdrPassword.current}
                onTextChange={handleHyperHdrPasswordChange}
                onSubmit={handlePasswordSubmit}
              />
            </View>
          ) : (
            <GrabberInstructions baseUrl={baseUrl} protoPort={protoPort} />
          )}
      </CommonDialog>

    </SafeAreaView>
  );
}

export default MainDashBoard;
