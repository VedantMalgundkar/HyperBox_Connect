import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import type { ColorFormatsObject } from 'reanimated-color-picker';
import ColorPicker, { colorKit, HueCircular, Panel1 } from 'reanimated-color-picker';
import { useLedApi } from '../../api/ledApi';
import { colorPickerStyle } from './colorPickerStyle';
import Divider from './Divider';
import { commonStyles } from '../../styles/common';
import { useTheme } from 'react-native-paper';

type CustomColorPickerProps = {
  isHdmiOverriden: boolean;
  isItOkayToCallApi: (action: () => void) => boolean;
  onColorClearOrChange: () => void;
};

// generate 6 random colors for swatches
const customSwatches = new Array(6).fill('#fff').map(() => colorKit.randomRgbColor().hex());

export default function CustomColorPicker({ isHdmiOverriden, isItOkayToCallApi, onColorClearOrChange }: CustomColorPickerProps) {
  const [resultColor, setResultColor] = useState(customSwatches[0]);

  const {applyColor, getCurrentActiveInput, stopEffect} = useLedApi();

  const currentColor = useSharedValue(customSwatches[0]);

  const theme = useTheme();

  const rgbToHex = (rgb: number[]) =>
    `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;

  function hexToRgb(hex: string): number[] {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
      hex = hex.split("").map(c => c + c).join("");
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  }

  // runs on the ui thread on color change
  const onColorChange = (color: ColorFormatsObject) => {
    'worklet';
    currentColor.value = color.hex;
  };

  const callColorApi = async (rgbArray: number[]) => {
    try {
      const res = await applyColor(rgbArray);
      onColorClearOrChange();
    } catch (error: any) {
      console.error("applyColor failed:", error);

      Toast.show({
        type: 'error',
        text1: error.message ?? 'Error in Fetching Current Input',
        position: 'bottom',
        visibilityTime: 2000,
      });

      // fallback to black
      currentColor.value = "#000000";
      setResultColor("#000000");
    }
  }

  // runs on the js thread on color pick
  const onColorPick = async (color: ColorFormatsObject) => {
    // guard against accidental taps (no actual change)
    if (color.hex === resultColor) {
      console.log("Ignoring tap, color unchanged:", color.hex);
      return;
    }

    console.log("ran onColorPick with >>>>>", color.rgb);

    // update local shared value
    currentColor.value = color.hex;
    setResultColor(color.hex);

    // convert "rgb(30, 176, 91)" → [30,176,91]
    const rgbArray = color.rgb
      .replace(/[^\d,]/g, "")
      .split(",")
      .map(num => parseInt(num.trim(), 10));

    console.log("RGB Array:", rgbArray);

    const isitOkay = isItOkayToCallApi(() => callColorApi(rgbArray));

    if (isitOkay) {
      callColorApi(rgbArray);
    }

  };

  const fetchCurrentInputSource = async () => {
    try {
      const res = await getCurrentActiveInput();
      if (res.data.componentId.toLowerCase() == 'color') {
        const rgbColor = res.data.value.RGB;
        setResultColor(rgbToHex(rgbColor));
      }
      // console.log({ res });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.message ?? 'Error in Fetching Current Input',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  // Action for the last swatch (cross button)
  const handleClearColor = async () => {
    try {
      await stopEffect(100);
      setResultColor(customSwatches[0]);
      onColorClearOrChange();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.message ?? "failed to reset Led color/Effect", position: 'bottom' });
    }
  };

  const handleCustomSwatchePress = (swatch: string) => {
    currentColor.value = swatch;
    setResultColor(swatch);
    const rgbArray = hexToRgb(swatch);
    const isitOkay = isItOkayToCallApi(() => callColorApi(rgbArray));

    if (isitOkay) {
      callColorApi(rgbArray);
    }
  };

  useEffect(() => {
    fetchCurrentInputSource();
  }, []);

  return (
      <View style={[colorPickerStyle.pickerContainer,{backgroundColor:theme.colors.surfaceVariant}]}>
        {
          isHdmiOverriden && (
          <TouchableOpacity onPress={handleClearColor}>
            <Text style={{ color: theme.colors.onPrimary, backgroundColor: theme.colors.primary, position:"absolute", top:-12, right:-12, padding: 5, borderRadius: 5, fontSize:10}}>
              Switch to HDMI
            </Text>
          </TouchableOpacity>
          )
        }
        
        <ColorPicker
          value={resultColor}
          sliderThickness={20}
          thumbSize={24}
          onChange={onColorChange}
          onCompleteJS={onColorPick}
          style={colorPickerStyle.picker}
          boundedThumb
        >
          <HueCircular containerStyle={{ justifyContent: 'center' }} thumbShape='pill'>
            <Panel1 style={{ borderRadius: 16, width: '70%', height: '70%', alignSelf: 'center' }} />
          </HueCircular>

          <Divider />

          <View
            style={[
              colorPickerStyle.swatchesContainer,
              commonStyles.row,
            ]}
          >
            {customSwatches.map((swatch, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  colorPickerStyle.swatchStyle,
                  { backgroundColor: swatch },
                ]}
                onPress={() => {
                  handleCustomSwatchePress(swatch);
                }}
              />
            ))}

            <TouchableOpacity
              style={[colorPickerStyle.crossButton, commonStyles.center]}
              onPress={handleClearColor}
            >
              <MaterialDesignIcons name="close" size={20} color="#000" />
            </TouchableOpacity>
          </View>

        </ColorPicker>
      </View>
  );
}