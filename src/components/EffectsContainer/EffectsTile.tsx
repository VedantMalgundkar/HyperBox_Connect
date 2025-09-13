import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { commonStyles } from "../../styles/common";
import { useTheme } from "react-native-paper";

type EffectsTileProps = {
  title: string;
  isActive: boolean;
  onPress: () => void;
  style?: ViewStyle;
};


export default function EffectsTile({ title, isActive, onPress, style }: EffectsTileProps) {
  const theme = useTheme();
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.tile,
          commonStyles.bRadius,
          {backgroundColor: theme.colors.surfaceVariant},
          commonStyles.center,
          { padding:10 },
          isActive && { borderColor: theme.colors.primary, borderWidth: 1 },
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, {color: theme.colors.onSurfaceVariant}]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '100%',
  },
  title: {
    fontWeight: "600",
    textAlign: "center",
  },
});
