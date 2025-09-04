import React, { useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { commonStyles } from '../styles/common';
import { RootStackParamList } from '../navigation';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import HyperhdrScannerContent from '../components/HyperhdrScannerContent';

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MdnsScanner'
>;

const zeroconf = new Zeroconf();

export default function MdnsScanner() {
  const navigation = useNavigation<MdnsScannerNavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "My Devices",
      headerStyle: {
        backgroundColor: "#6200ee",
      },
      headerTintColor: "#fff",
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('BleScanner')}>
          <MaterialDesignIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleOpen = () => {
    navigation.replace('MainDashBoard');
  };

  return (
    <View style={styles.container}>
      {/* <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('MainDashBoard')}
      /> */}
      {/* <Text style={styles.title}>mDNS HyperHDR Scanner</Text> */}
      <HyperhdrScannerContent onConnect={handleOpen}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...commonStyles.container, paddingHorizontal: 15, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
