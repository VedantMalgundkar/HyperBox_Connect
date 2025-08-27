import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import HyperhdrDiscoveryTile, { HyperhdrDevice } from '../components/HyperhdrDiscoveryTile';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConnection } from '../api/ConnectionContext';

import { RootStackParamList } from '../navigation';

// ✅ Type the navigation hook
type MdnsScannerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MdnsScanner'
>;

const zeroconf = new Zeroconf();

export default function MdnsScanner() {
  const [services, setServices] = useState<Record<string, HyperhdrDevice>>({});
  const navigation = useNavigation<MdnsScannerNavigationProp>();
  const { setBaseUrl } = useConnection();

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

  const handleHyperhdrDiscoveryTileClick = (url: string) => {
    setBaseUrl(url);
  } 

  return (
    <View style={styles.container}>
      <Button
        title="Go to Dashboard"
        onPress={() => navigation.navigate('MainDashBoard')}
      />
      <Text style={styles.title}>mDNS HyperHDR Scanner</Text>
      <FlatList
        data={Object.values(services)}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <HyperhdrDiscoveryTile device={item} onConnect={handleHyperhdrDiscoveryTileClick}/>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
