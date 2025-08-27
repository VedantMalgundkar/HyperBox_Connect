import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { commonStyles } from "../../styles/common";

type EffectsTileProps = {
  title: string;
  isActive: boolean;
  onPress: () => void;
  style?: ViewStyle;
};


export default function EffectsTile({ title, isActive, onPress, style }: EffectsTileProps) {
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.tile,
          commonStyles.card,
          commonStyles.center,
          { padding:10 },
          isActive && { borderColor: "#007BFF" },
        ]}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
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
