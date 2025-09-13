import React from "react";
import { View, ViewStyle } from "react-native";
import Modal, { ModalProps } from "react-native-modal";

interface BottomSheetModalProps extends Partial<ModalProps> {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle: ViewStyle;
  modalStyle: ViewStyle;
}

const CommonModal: React.FC<BottomSheetModalProps> = ({
  isVisible,
  onClose,
  children,
  containerStyle,
  modalStyle,
  ...restProps // 👈 pass everything else to Modal
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={[modalStyle]}
      statusBarTranslucent={true}
      {...restProps} // 👈 consumer overrides (animation, timings, etc.)
    >
      <View
        style={[
          containerStyle,
        ]}
      >
        {children}
      </View>
    </Modal>
  );
};

export default CommonModal;
