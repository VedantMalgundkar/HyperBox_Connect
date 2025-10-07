// WifiIconButton.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { commonStyles } from "../styles/common";
import { useTheme } from "react-native-paper";
import { useSysApi } from "../api/sysApi";
import { Text } from "react-native-paper";

type WifiIconButtonProps = {
  onPress: (macId: string) => void;
};

const WifiIconButton: React.FC<WifiIconButtonProps> = ({ onPress }) => {
    const theme = useTheme();
    const [mac, setMac] = useState<string>("---");
    const [connectedWifi, setConnectedWifi] = useState<string | undefined>();
    const { getMac, getConnectedWifi } = useSysApi();

    const handleWifiIconClick = () => {
        console.log("handleWifiIconClick >>>>", mac);
        if(mac) {
            onPress(mac);
        }    
    }

    const fetchConnectedWifi = async () => {
        try {
            const res = await getConnectedWifi();
            if(res?.network?.ssid) {
                setConnectedWifi(res.network.ssid)
            }
        } catch (error) {
            console.log("error in fetchConnectedWifi >>",error);
        }

    }

    const fetchDeviceMac = async () => {
        try {
            const res = await getMac();
            console.log("fetchDeviceMac >>>",res);
            if (res.mac) {
                setMac(res.mac.toUpperCase());
            }
            
        } catch (error) {
            console.log("error in fetchDeviceMac >>>",error);
        }
    }

    useEffect(()=>{
        fetchDeviceMac();
        fetchConnectedWifi();
    },[])

  return (
    <View
        style={[
            commonStyles.column,
            commonStyles.center,
            { minWidth: 40, marginRight: 8 },
        ]}
        >
        <View onTouchEnd={handleWifiIconClick}>
            <MaterialIcons
            name="wifi"
            size={20}
            color={theme.colors.onPrimary}
            />
        </View>
        <Text
            style={{
            fontSize: 7,
            color: theme.colors.onPrimary,
            maxWidth: 45,
            textAlign: "center",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
        >
            {connectedWifi}
        </Text>
        </View>
  );
};

export default WifiIconButton;
