import React, { useState } from "react";
import MenuRow from "./MenuRow";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import {TextStyle} from "react-native";

interface CopyRowProps {
  textToCopy: string;
  label?: string;
  resetDelay?: number;
  color?: string;
  textStyle?: TextStyle;
}

const CopyHyperUrl: React.FC<CopyRowProps> = ({
  textToCopy,
  label = "Copy page URL",
  resetDelay = 1500,
  color = "#000",
  textStyle,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), resetDelay);
  };

  return (
    <MenuRow
      renderIcon={() => (
        <MaterialIcons
          name={copied ? "check" : "content-copy"}
          size={20}
          color={color}
        />
      )}
      label={label}
      textStyle={textStyle}
      onPress={handleCopy}
    />
  );
};

export default CopyHyperUrl;
