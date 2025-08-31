import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import HyperhdrDiscoveryTile, { HyperhdrDevice } from '../components/HyperhdrDiscoveryTile';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConnection } from '../api/ConnectionContext';
import { commonStyles } from '../styles/common';
import { RootStackParamList } from '../navigation';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MdnsScanner'
>;

const zeroconf = new Zeroconf();

export default function MdnsScanner({wantAppBar = true}) {
  const [services, setServices] = useState<Record<string, HyperhdrDevice>>({});
  const navigation = useNavigation<MdnsScannerNavigationProp>();
  const { setBaseUrl,ws } = useConnection();

  useEffect(() => {
    zeroconf.on('start', () => console.log('🔍 Scanning started'));
    zeroconf.on('found', (name) => console.log('✅ Found service:', name));
    zeroconf.on('resolved', (service: HyperhdrDevice) => {
      console.log('📡 Resolved service:', service);
      setServices(prev => ({ ...prev, [service.name]: service }));
    });
    zeroconf.on('error', err => console.error('❌ Error:', err));
    zeroconf.on('stop', () => console.log('🛑 Scan stopped'));

    zeroconf.scan('hyperhdr', 'tcp', 'local.');

    return () => {
      zeroconf.stop();
      zeroconf.removeAllListeners();
    };
  }, []);

  useLayoutEffect(() => {
    if(wantAppBar) {
      navigation.setOptions({
        title: "My Devices",
        headerStyle: {
          backgroundColor: "#6200ee",
        },
        headerTintColor: "#fff",
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('ModalTester')}>
            <MaterialDesignIcons name="plus" size={28} color="#fff" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({ headerShown: false })
    }
  }, [navigation]);

  const handleHyperhdrDiscoveryTileClick = (url: string) => {
    setBaseUrl(url);
  } 

  useEffect(() => {
    if (!ws) return;

    const handleOpen = () => {
      navigation.replace('MainDashBoard');
    };

    ws.addEventListener("open", handleOpen);

    return () => {
      ws.removeEventListener("open", handleOpen);
    };
  }, [ws]);

  return (
    <View style={styles.container}>
      {/* <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('MainDashBoard')}
      /> */}
      {/* <Text style={styles.title}>mDNS HyperHDR Scanner</Text> */}
      <FlatList
        data={Object.values(services)}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <HyperhdrDiscoveryTile device={item} onConnect={handleHyperhdrDiscoveryTileClick}/>
        )}
        style={{ paddingVertical:15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...commonStyles.container, paddingHorizontal: 15, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
