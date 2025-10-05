import React, { useState } from "react";
import { TextInput } from "react-native-paper";

type PaperTextInputProps = {
  mode?: "flat" | "outlined"; 
  label: string;
  onTextChange?: (newText: string) => void;
  onSubmit?: (finalText: string) => void;
} & Omit<React.ComponentProps<typeof TextInput>, "onChangeText" | "onSubmitEditing">;

export const PaperTextInput: React.FC<PaperTextInputProps> = ({
  mode = "flat",
  label,
  onTextChange,
  onSubmit,
  ...props
}) => {
  const [text, setText] = useState(props?.value ?? props?.defaultValue );
  const [showText, setShowText] = useState(false);

  return (
    <TextInput
      mode={mode}
      label={label}
      defaultValue={text}
      secureTextEntry={!showText}
      returnKeyType="done"
      onChangeText={(val) => {
        setText(val);
        onTextChange?.(val); // call user-defined handler
      }}
      onSubmitEditing={() => {
        if (text) {
          onSubmit?.(text); // fire submit callback separately
        }
      }}
      {...props}
      right={
        <TextInput.Icon
          icon={showText ? "eye-off" : "eye"}
          onPress={() => setShowText((prev) => !prev)}
        />
      }
    />
  );
};
