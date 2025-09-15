
import {Permission, PermissionsAndroid, Linking, Alert} from "react-native";

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

export const handlePermissions = async (permissions: Permission[]): Promise<boolean> => {
    const status = await requestPermissions(permissions);

    console.log({ status });

    if (status === "granted") {
        console.log("✅ All permissions granted");
        return true;
    } else if (status === "denied") {
        console.log("❌ Permissions denied, can try again later");
        return false;
    } else if (status === "blocked") {
        showPermissionPopup(
            "Permission required",
            "Please enable Bluetooth and Location permissions in Settings.",
            () => Linking.openSettings(),
            "Open Settings"
        )
        return false;
    }

    return false;
};

export const fakeApi = (ms = 1500) => new Promise(res => setTimeout(res, ms));