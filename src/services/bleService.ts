// bleService.ts
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { Buffer } from "buffer";

// UUIDs from your Python BLE server
const WIFI_SERVICE_UUID = "00000001-710e-4a5b-8d75-3e5b444bc3cf";
const SCAN_CHAR_UUID = "00000003-710e-4a5b-8d75-3e5b444bc3cf";
const STATUS_CHAR_UUID = "00000004-710e-4a5b-8d75-3e5b444bc3cf";
const IP_CHAR_UUID = "00000005-710e-4a5b-8d75-3e5b444bc3cf";
const MAC_CHAR_UUID = "00000006-710e-4a5b-8d75-3e5b444bc3cf";
const WIFI_ACTION_CHAR_UUID = "00000008-710e-4a5b-8d75-3e5b444bc3cf";

// Utility: base64 <-> utf8
const decodeUtf8 = (base64: string): string =>
  Buffer.from(base64, "base64").toString("utf-8");
const encodeUtf8 = (str: string): string =>
  Buffer.from(str, "utf-8").toString("base64");

// ========== Connection ==========
export async function connectToDevice(
  bleManager: BleManager,
  deviceId: string
): Promise<Device> {
  const device = await bleManager.connectToDevice(deviceId, {
    timeout: 10000,
  });
  console.log(`Connected to ${deviceId}`);
  return device;
}

export async function disconnect(bleManager: BleManager, connectedDeviceId: string): Promise<void> {
  if (connectedDeviceId) {
    await bleManager.cancelDeviceConnection(connectedDeviceId);
    console.log("Disconnected successfully");
  }
}

// ========== WiFi Scanning ==========
export async function discoverAndReadWifi(
  bleManager: BleManager,
  deviceId: string
): Promise<Record<string, any>[]> {
  const device = await bleManager.discoverAllServicesAndCharacteristicsForDevice(
    deviceId
  );

  const characteristics = await device.characteristicsForService(
    WIFI_SERVICE_UUID
  );

  const scanChar = characteristics.find((c) => c.uuid === SCAN_CHAR_UUID);
  if (!scanChar) return [];

  return await readWifiList(bleManager, deviceId, scanChar.uuid);
}

function fixPartialJson(raw: string): string {
  if (raw.startsWith("[")) raw = raw.slice(1);
  if (raw.endsWith("]")) raw = raw.slice(0, -1);

  const parts = raw.split("},");
  parts.pop();

  const fixedParts = parts.map((p) => {
    p = p.trim();
    if (!p.endsWith("}")) p += "}";
    return p;
  });

  return `[${fixedParts.join(",")}]`;
}

async function readWifiList(
  bleManager: BleManager,
  deviceId: string,
  charUuid: string
): Promise<Record<string, any>[]> {
  const characteristic = await bleManager.readCharacteristicForDevice(
    deviceId,
    WIFI_SERVICE_UUID,
    charUuid
  );
  const jsonStr = decodeUtf8(characteristic.value ?? "");
  const fixedJsonStr = fixPartialJson(jsonStr);

  return JSON.parse(fixedJsonStr);
}

// ========== Write WiFi Credentials ==========
export async function writeCredentials(
  bleManager: BleManager,
  deviceId: string,
  ssid: string,
  password: string
): Promise<boolean> {
  const payload = JSON.stringify({ s: ssid, p: password });
  await bleManager.writeCharacteristicWithResponseForDevice(
    deviceId,
    WIFI_SERVICE_UUID,
    SCAN_CHAR_UUID,
    encodeUtf8(payload)
  );
  console.log("Wi-Fi credentials sent");
  return true;
}

// ========== WiFi Actions ==========
export async function commonWifiActions(
  bleManager: BleManager,
  deviceId: string,
  ssid: string,
  action: "add" | "sub" | "del"
): Promise<string> {
  if (!["add", "sub", "del"].includes(action)) {
    throw new Error(`Invalid action: ${action}`);
  }

  const payload = JSON.stringify({ s: ssid, a: action });
  const writePromise = bleManager.writeCharacteristicWithResponseForDevice(
    deviceId,
    WIFI_SERVICE_UUID,
    WIFI_ACTION_CHAR_UUID,
    encodeUtf8(payload)
  );

  return new Promise(async (resolve) => {
    let subscription: any;

    try {
      subscription = bleManager.monitorCharacteristicForDevice(
        deviceId,
        WIFI_SERVICE_UUID,
        STATUS_CHAR_UUID,
        (error, char) => {
          if (error) {
            console.error("Monitor error:", error);
            resolve(JSON.stringify({ status: "failed", error: "monitor" }));
            subscription?.remove();
            throw error;
          }

          const decoded = decodeUtf8(char?.value ?? "");
          console.log("Received WiFi status update:", decoded);

          try {
            const data = JSON.parse(decoded);
            if (["success", "failed"].includes(data.status)) {
              resolve(decoded);
              subscription?.remove();
            }
          } catch {
            console.error("Error decoding status JSON");
          }
        }
      );

      await writePromise;
      console.log(`Wi-Fi ${action} request sent`);
    } catch (e) {
      console.error("Write failed:", e);
      subscription?.remove();
      resolve(JSON.stringify({ status: "failed", error: "write_error" }));
      throw e;
    }

    // Timeout safeguard
    setTimeout(() => {
      subscription?.remove();
      resolve(JSON.stringify({ status: "failed", error: "timeout" }));
    }, 15000);
  });
}

// ========== Read Helpers ==========
export async function readStatus(bleManager: BleManager, deviceId: string): Promise<string> {
  const char = await bleManager.readCharacteristicForDevice(
    deviceId,
    WIFI_SERVICE_UUID,
    STATUS_CHAR_UUID
  );
  return decodeUtf8(char.value ?? "");
}

export async function readIp(bleManager: BleManager, deviceId: string): Promise<string> {
  const char = await bleManager.readCharacteristicForDevice(
    deviceId,
    WIFI_SERVICE_UUID,
    IP_CHAR_UUID
  );
  return decodeUtf8(char.value ?? "");
}

export async function readMac(bleManager: BleManager, connectedDeviceId:string): Promise<string> {
  if (!connectedDeviceId) return "";
  const char = await bleManager.readCharacteristicForDevice(
    connectedDeviceId,
    WIFI_SERVICE_UUID,
    MAC_CHAR_UUID
  );
  return decodeUtf8(char.value ?? "");
}
