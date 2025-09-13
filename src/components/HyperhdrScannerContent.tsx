import React, { useEffect, useState, useRef } from 'react';
import { View, findNodeHandle, InteractionManager } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import HyperhdrDiscoveryTile, { HyperhdrDevice } from '../components/HyperhdrDiscoveryTile';
import { useConnection } from '../api/ConnectionContext';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const zeroconf = new Zeroconf();

type HyperhdrScannerContentProps = {
  onConnect: () => void;
  onDeviceNameUpdating?: (loadingState: boolean) => void;
};

export default function HyperhdrScannerContent({onConnect, onDeviceNameUpdating}: HyperhdrScannerContentProps) {
  const [services, setServices] = useState<Record<string, HyperhdrDevice>>({});
  const { setBaseUrl,ws } = useConnection();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  // useEffect(() => {
  // // Fixed device
  // const fixedDevice: HyperhdrDevice = {
  //     name: "My Fixed Device",
  //     fullName: "Always Present Device",
  //     host: "192.168.0.100",
  //     port: 19444,
  //   };

  //   // Generate random devices
  //   const randomDevices: HyperhdrDevice[] = Array.from({ length: 19 }, (_, i) => ({
  //     name: `Device ${i + 1}`,
  //     fullName: `Random Device ${i + 1}`,
  //     host: `192.168.0.${Math.floor(Math.random() * 200) + 2}`, // random 2-201
  //     port: 19444,
  //   }));

  //   // Merge fixed + random
  //   const allDevices = [fixedDevice, ...randomDevices];

  //   // Set all devices in state
  //   allDevices.forEach((service) => {
  //     setServices((prev) => ({ ...prev, [service.name]: service }));
  //   });
  // }, []);

  useEffect(() => {
    zeroconf.on('start', () => console.log('🔍 Scanning started'));
    zeroconf.on('found', (name) => console.log('✅ Found service:', name));
    zeroconf.on('resolved', (service: HyperhdrDevice) => {
    // Filter out IPv6 addresses (fe80::/10)
    const ipv4Address = service.addresses?.find(addr => addr.includes('.')); // IPv4 contains '.'

    if (!ipv4Address) {
      console.log('Skipping IPv6-only service:', service);
      return; // skip this service
    }

    console.log('📡 Resolved service (IPv4):', service);

    setServices(prev => ({
      ...prev,
      [ipv4Address]: service, // use IPv4 as key
    }));
  });
    zeroconf.on('error', err => console.error('❌ Error:', err));
    zeroconf.on('stop', () => console.log('🛑 Scan stopped'));

    zeroconf.scan('hyperhdr', 'tcp', 'local.');

    return () => {
      console.log("hyper scanner cleanup ran >>");
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
      <KeyboardAwareScrollView
        ref={scrollRef}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
        contentContainerStyle={{ paddingVertical: 13 }}
        keyboardShouldPersistTaps="handled"
      >
        {Object.values(services).map((item) => (
          <View key={item.name} style={{ marginBottom: 14, marginHorizontal: 15}}>
            <HyperhdrDiscoveryTile
              device={item}
              onConnect={handleHyperhdrDiscoveryTileClick}
              onDeviceNameUpdating={onDeviceNameUpdating}
            />
          </View>
        ))}
      </KeyboardAwareScrollView>
  );
}
