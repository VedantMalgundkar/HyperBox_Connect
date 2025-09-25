import React, {useLayoutEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {useTheme, Appbar} from 'react-native-paper';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {RootDrawerParamList} from '../navigation';
import {useNavigation} from '@react-navigation/native';
import WebViewComponent from '../components/WebViewComponent';
import {Checkbox} from 'react-native-paper';
import {MaterialIcons} from '@react-native-vector-icons/material-icons';
import CommonModal from '../components/CommonModal';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MenuRow from '../components/MenuRow';
import CopyHyperUrl from '../components/CopyHyperUrl';
// Define type for navigation props
// type Props = NativeStackScreenProps<RootStackParamList, 'WebViewScreen'>;
type WebViewProp = DrawerNavigationProp<RootDrawerParamList, 'WebViewScreen'>;

export default function WebViewScreen() {
  const theme = useTheme();
  const navigation = useNavigation<WebViewProp>();
  const [isRightModalVisible, setRightModalVisible] = useState<boolean>(false);
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(false);

  const openModal = () => {
    setRightModalVisible(true);
  };

  const handleToggleDesktopMode = () => {
    setIsDesktopMode(prev => !prev);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Appbar.Header style={{backgroundColor: theme.colors.primary}}>
          <Appbar.Action
            icon="menu"
            color={theme.colors.onPrimary}
            onPress={() => navigation.toggleDrawer()}
          />
          <Appbar.Content
            title="HyperHDR Panel"
            titleStyle={{color: theme.colors.onPrimary}}
          />
          <Appbar.Action
            icon="dots-vertical"
            color={theme.colors.onPrimary}
            onPress={openModal}
          />
        </Appbar.Header>
      ),
    });
  }, [navigation, theme]);

  const closeModal = () => {
    setRightModalVisible(false);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.surface}}>
      <WebViewComponent
        key={Number(isDesktopMode)}
        isDesktopMode={isDesktopMode}
      />

      <CommonModal
        isVisible={isRightModalVisible}
        onClose={closeModal}
        modalStyle={{margin: 0}}
        containerStyle={{
          backgroundColor: theme.colors.surfaceVariant,
          position: 'absolute',
          top: hp(7),
          right: 10,
          width: 200,
          borderRadius: 15,
          paddingTop: 5,
          paddingBottom: 10,
          paddingHorizontal: 5,
        }}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        useNativeDriver={true}
        backdropOpacity={0}>
        <MenuRow
          renderIcon={() => (
            <MaterialIcons
              name="desktop-windows"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          label="Desktop site"
          onPress={handleToggleDesktopMode}
          trailing={
            <Checkbox status={isDesktopMode ? 'checked' : 'unchecked'} />
          }
          textStyle={{color: theme.colors.onSurfaceVariant}}
        />

        <CopyHyperUrl
          textStyle={{color: theme.colors.onSurfaceVariant}}
          textToCopy="Hiii"
          color={theme.colors.onSurfaceVariant}
        />
      </CommonModal>
    </SafeAreaView>
  );
}
