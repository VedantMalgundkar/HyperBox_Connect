import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { commonStyles } from "../styles/common";

interface MenuRowProps {
  renderIcon: () => React.ReactNode;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const MenuRow: React.FC<MenuRowProps> = ({
  renderIcon,
  label,
  onPress,
  trailing,
  containerStyle,
  textStyle,
}) => {
  const Wrapper: React.ElementType = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        commonStyles.row,
        commonStyles.justifyBet,
        { paddingVertical: 5 },
        containerStyle,
      ]}
    >
      <View
        style={[
          commonStyles.row,
          commonStyles.justifyBet,
          { gap: 10, paddingLeft: 8 },
        ]}
      >
        {renderIcon()}
        <Text style={[textStyle]}>{label}</Text>
      </View>
      {trailing}
    </Wrapper>
  );
};

export default MenuRow;
