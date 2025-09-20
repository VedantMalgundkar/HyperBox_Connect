
import {Permission, PermissionsAndroid, Linking, Alert} from "react-native";
import { BleManager, State } from "react-native-ble-plx";

const requestPermissions = async (
    permissions: Permission[]
): Promise<"granted" | "denied" | "blocked"> => {

    const result = await PermissionsAndroid.requestMultiple(permissions);
    const values = Object.values(result);

    if (values.every((v) => v === PermissionsAndroid.RESULTS.GRANTED)) {
        return "granted";
    }

    if (values.some((v) => v === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)) {
        return "blocked"; // must go to settings
    }

    return "denied"; // denied, can ask again
};

export const showPermissionPopup = (
    title: string,
    message: string,
    confirmCallback: () => void,
    confirmText: string = "OK"
    ) => {
    const buttons = [
        { text: "Cancel", style: "cancel" as const },
        { text: confirmText, onPress: confirmCallback },
    ]

    Alert.alert(title, message, buttons)
    }

export const handlePermissions = async (permissions: Permission[]) => {
    const status = await requestPermissions(permissions);
    return status;
};

export const checkBluetooth = async (bleManager: BleManager) => {
    const state = await bleManager.state();
    return state == State.PoweredOn 
}

export const reqBluetooth = async (bleManager: BleManager, handleBluetoothOff: () => void) => {
    const bluPowerRes = await checkBluetooth(bleManager);
    if(!bluPowerRes) {
        handleBluetoothOff();
    }
    return bluPowerRes
}

export const reqBluetoothPerms = async (handlePermissionBlocked:() => void) => {
    const requiredPermissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ];

    const permissionRes = await handlePermissions(requiredPermissions);
    if(permissionRes == "blocked") {
        handlePermissionBlocked();
    }
    return permissionRes;
}


export const fakeApi = (ms = 1500) => new Promise(res => setTimeout(res, ms));