import React from "react";
import { View, ViewStyle, Platform, Dimensions, StatusBar } from "react-native";
import Modal, { ModalProps } from "react-native-modal";

// Get device width and height
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get('window').height;

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
  ...restProps
}) => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 20;
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      statusBarTranslucent={true}
      deviceWidth={deviceWidth}
      deviceHeight={statusBarHeight && deviceHeight+statusBarHeight}
      style={[ modalStyle]}
      {...restProps}
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
