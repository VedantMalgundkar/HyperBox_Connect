import React, { useState } from "react";
import { Button, Text, View, Dimensions } from "react-native";
import Modal from "react-native-modal";
import MdnsScanner from "./MdnsScanner";

const { height } = Dimensions.get("window");

function ModalTester() {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={{ flex: 1 }}>
      <Button title="Show modal" onPress={toggleModal} />
      <Modal
        isVisible={isModalVisible}
        animationIn="slideInDown"
        animationOut="slideOutUp"
        animationInTiming={400}
        animationOutTiming={400}
        style={{ margin: 0, justifyContent: "flex-start" }}
      >
        <View
          style={{
            height: height * 0.6, // 👈 50% of screen
            backgroundColor: "white",
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            padding: 20,
          }}
        >
          <MdnsScanner wantAppBar={false}/>
          <Button title="Hide modal" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
}

export default ModalTester;
