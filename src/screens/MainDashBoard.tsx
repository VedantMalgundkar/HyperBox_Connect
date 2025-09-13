import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BrightnessSlider from "../components/BrightnessSlider";
import EffectTileContainer from "../components/EffectsContainer/EffectsContainer";
import InputSourceDashBoard from "../components/InputSourceDashBoard";
import { useState, useEffect, useLayoutEffect } from "react";
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
import { useTheme } from "react-native-paper";

type Props = NativeStackScreenProps<RootStackParamList, 'MainDashBoard'>;

const MainDashBoard = ({ navigation }: Props) => {
  const [hasCleared, setHasCleared] = useState<boolean>(false);
  const [isChangeDeviceDrawerOpen, setIsChangeDeviceDrawerOpen] = useState(false);
  const [isDeviceNameUpdating, setDeviceNameUpdating] = useState(false);
  const theme = useTheme(); // Paper theme

  const handleWifiIconClick = () => {
    console.log("handleWifiIconClick >>>>");
  }

  const openDrawer = () => {
    setIsChangeDeviceDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (!isDeviceNameUpdating) {
      setIsChangeDeviceDrawerOpen(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Light Studio",
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: theme.colors.onPrimary,
      headerRight: () => (
        <View style={[commonStyles.row, { gap: 5 }]}>
          <View
            onTouchEnd={openDrawer}
            style={[commonStyles.row, {
              gap: 4,
              backgroundColor: theme.colors.surfaceVariant,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 30,
            }]}
          >
            <MaterialIcons name="sync-alt" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={{ fontSize: 9, color: theme.colors.onSurfaceVariant }}>Change Device</Text>
          </View>

          {/* Wifi Icon + SSID */}
          <View style={[commonStyles.column, commonStyles.center, { minWidth: 40 }]}>
            <View onTouchEnd={handleWifiIconClick}>
              <MaterialIcons name="wifi" size={20} color={theme.colors.onPrimary} />
            </View>
            <Text
              style={{ fontSize: 8, color: theme.colors.onPrimary, maxWidth: 40, textAlign: "center" }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              test wifi
            </Text>
          </View>
        </View>
      ),
    });
  }, [navigation,theme]);

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
        <InputSourceDashBoard />
        <CustomColorPicker onColorClearOrChange={() => setHasCleared((prev) => !prev)} />
        <EffectTileContainer hasCleared={hasCleared} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default MainDashBoard;
