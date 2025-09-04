import AsyncStorage from '@react-native-async-storage/async-storage';
import { Device } from "react-native-ble-plx";

const RECENT_DEVICES_KEY = 'recent_connected_devices';
const MAX_RECENT_DEVICES = 5;

interface StoredDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  lastConnected: string;
}

export const storeRecentDevice = async (device: Device): Promise<StoredDevice[]> => {
  try {
    const existingDevices = await getRecentDevices();

    // Check if device already exists
    const deviceExists = existingDevices.some(d => d.id === device.id);

    if (deviceExists) {
      console.log('Device already exists in recent list:', device.name);
      const sortedDevices = existingDevices.sort(
        (a, b) => new Date(b.lastConnected).getTime() - new Date(a.lastConnected).getTime()
      );
      return sortedDevices;
    }

    const newDevice: StoredDevice = {
      id: device.id,
      name: device.name,
      rssi: device.rssi,
      lastConnected: new Date().toISOString(),
    };

    const updatedDevices = [newDevice, ...existingDevices];
    const recentDevices = updatedDevices.slice(0, MAX_RECENT_DEVICES);

    await AsyncStorage.setItem(RECENT_DEVICES_KEY, JSON.stringify(recentDevices));
    return recentDevices;
  } catch (error) {
    console.error('Error storing recent device:', error);
    return [];
  }
};

export const getRecentDevices = async (): Promise<StoredDevice[]> => {
  try {
    const storedDevices = await AsyncStorage.getItem(RECENT_DEVICES_KEY);
    return storedDevices ? JSON.parse(storedDevices) : [];
  } catch (error) {
    console.error('Error getting recent devices:', error);
    return [];
  }
};

export const removeRecentDevice = async (deviceId: string): Promise<StoredDevice[]> => {
  try {
    const existingDevices = await getRecentDevices();
    const filteredDevices = existingDevices.filter(d => d.id !== deviceId);
    await AsyncStorage.setItem(RECENT_DEVICES_KEY, JSON.stringify(filteredDevices));
    return filteredDevices;
  } catch (error) {
    console.error('Error removing recent device:', error);
    return [];
  }
};
