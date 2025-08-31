import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BrightnessSlider from "../components/BrightnessSlider";
import EffectTileContainer from "../components/EffectsContainer/EffectsContainer";
import InputSourceDashBoard from "../components/InputSourceDashBoard";
import { useState, useLayoutEffect } from "react";
import { Button, SafeAreaView, ScrollView, TouchableOpacity, View, Text } from "react-native";
import CustomColorPicker from "../components/CustomColorPicker/CustomColorPicker";
import { commonStyles } from "../styles/common";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { theme } from '../styles/common';

import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MainDashBoard'>;

const MainDashBoard = ({ navigation }: Props) => {
  const [hasCleared, setHasCleared] = useState<boolean>(false);
  const [isChangeDeviceDrawerOpen, setIsChangeDeviceDrawerOpen] = useState(false);

  const handleWifiIconClick = () => {
    console.log("handleWifiIconClick >>>>");
  }


  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Light Studio",
      headerStyle: {
        backgroundColor: theme.primary,
      },
      headerTintColor: "#fff",
      headerRight: () => (
          <View style={[commonStyles.row, {gap: 5}]}>
            {/* Change Device button */}
            <TouchableOpacity
              onPress={() => setIsChangeDeviceDrawerOpen(prev => !prev)}
              style={{
                backgroundColor: "#fff",
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 30,
              }}
            >
              <View style={[commonStyles.row,{gap:4}]}>
                <MaterialIcons name="sync-alt" size={14} color={theme.primary} />
                <Text style={{ fontSize: 9, color: theme.primary }}>
                  Change Device
                </Text>
              </View>
            </TouchableOpacity>

            {/* Wifi Icon + SSID text below */}
            <View style={[commonStyles.column, commonStyles.center, { minWidth: 40 } ]}>
              <TouchableOpacity onPress={handleWifiIconClick}>
                <MaterialIcons name="wifi" size={20} color="#fff" />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 8,
                  color: "#fff",
                  maxWidth: 40,
                  textAlign: "center",
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                test wifi
              </Text>
            </View>
          </View>
        ),
      
    });
  }, [navigation]);

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
        <BrightnessSlider />
        <InputSourceDashBoard />
        <CustomColorPicker onColorClearOrChange={() => setHasCleared((prev) => !prev)} />
        <EffectTileContainer hasCleared={hasCleared} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default MainDashBoard;
