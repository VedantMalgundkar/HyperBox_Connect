import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BrightnessSlider from "../components/BrightnessSlider";
import EffectTileContainer from "../components/EffectsContainer/EffectsContainer";
import InputSourceDashBoard from "../components/InputSourceDashBoard";
import { useState } from "react";
import { Button, SafeAreaView, ScrollView } from "react-native";
import CustomColorPicker from "../components/CustomColorPicker/CustomColorPicker";
import { commonStyles } from "../styles/common";

import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MainDashBoard'>;

const MainDashBoard = ({ navigation }: Props) => {
  const [hasCleared, setHasCleared] = useState<boolean>(false);

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
