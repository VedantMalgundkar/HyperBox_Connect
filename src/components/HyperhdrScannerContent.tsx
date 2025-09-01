import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import HyperhdrDiscoveryTile, { HyperhdrDevice } from '../components/HyperhdrDiscoveryTile';
import { useConnection } from '../api/ConnectionContext';

const zeroconf = new Zeroconf();

type HyperhdrScannerContentProps = {
  onConnect: () => void;
};

export default function HyperhdrScannerContent({onConnect}: HyperhdrScannerContentProps) {
  const [services, setServices] = useState<Record<string, HyperhdrDevice>>({});
  const { setBaseUrl,ws } = useConnection();

  // useEffect(() => {
  //   const fakeData: HyperhdrDevice[] = Array.from({ length: 20 }, (_, i) => ({
  //     name: `Device ${i + 1}`,
  //     fullName: `Fake Device ${i + 1}`,
  //     host: `192.168.0.${i + 1}`,
  //     port: 19444,
  //   }));

  //   fakeData.forEach((service) => {
  //     setServices((prev) => ({ ...prev, [service.name]: service }));
  //   });
  // }, []);

  useEffect(() => {
    zeroconf.on('start', () => console.log('🔍 Scanning started'));
    zeroconf.on('found', (name) => console.log('✅ Found service:', name));
    zeroconf.on('resolved', (service: HyperhdrDevice) => {
      console.log('📡 Resolved service:', service);
      setServices(prev => ({ ...prev, 
        [service.name]: service,
       }));
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

  useEffect(() => {
    if (!ws) return;

    const handleOpen = () => {
      onConnect();
    };

    ws.addEventListener("open", handleOpen);

    return () => {
      ws.removeEventListener("open", handleOpen);
    };
  }, [ws]);

  return (
      <FlatList
        data={Object.values(services)}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <HyperhdrDiscoveryTile device={item} onConnect={handleHyperhdrDiscoveryTileClick}/>
        )}
        contentContainerStyle={{
          paddingVertical:13,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
  );
}
