import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { Button, StyleSheet, Text, TextStyle, View, ViewStyle, TouchableOpacity } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useLedApi } from '../api/ledApi';
import { commonStyles, theme } from '../styles/common';
import { useConnection } from "../api/ConnectionContext";
import { isEmptyObject } from '../utils/helper';

import { useTheme } from 'react-native-paper';
import { Priority, InputTile, WsResponse } from '../types/wsTypes';
import { getHyperHdrPassword } from '../services/storage/regularStorage';

export type InputSourceDashBoardProps = {
  containerStyle?: ViewStyle;
  boxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  gap?: number;
  // isHdmiOn: boolean;
  currentInput: Priority | null;
  setCurrentInput: Dispatch<SetStateAction<Priority | null>>;
  onHdmiInputChange: (isHdmiConnected: boolean) => void; 
  // onHdmiOverride: (isHdmiConnected: boolean) => void;
  onProtoPortChange: (port: number) => void;
  onGrabberAboutClick: () => void;
  onUnAuthError: () => void;
  getHyperHdrLogin: (action: (password: string) => void) => void;
};

interface LedPositionData {
  group: number;
  hmax: number;
  hmin: number;
  vmax: number;
  vmin: number;
};

export interface TrfLedPosition extends LedPositionData {
  color: number[];
  led_ind: number;
}

interface TransformPositionResult {
  leds: TrfLedPosition[];
  directions: {
    top: TrfLedPosition[];
    bottom: TrfLedPosition[];
    left: TrfLedPosition[];
    right: TrfLedPosition[];
  };
}

interface TransformPositionFunction {
  (
    ledPositions: LedPositionData[],
    ledColorFlat: number[],
    callbackToResetLedPositions: () => Promise<LedPositionData[]>,
    TOP_THRESHOLD?: number,
    BOTTOM_THRESHOLD?: number,
    LEFT_THRESHOLD?: number,
    RIGHT_THRESHOLD?: number
  ): Promise<TransformPositionResult>;
}

type directions = { top: TrfLedPosition[]; bottom: TrfLedPosition[]; left: TrfLedPosition[]; right: TrfLedPosition[] };

const InputSourceDashBoard: React.FC<InputSourceDashBoardProps> = ({
  containerStyle,
  boxStyle,
  labelStyle,
  gap = 12,
  // isHdmiOn,
  currentInput,
  setCurrentInput,
  onHdmiInputChange,
  // onHdmiOverride,
  onProtoPortChange,
  onGrabberAboutClick,
  onUnAuthError,
  getHyperHdrLogin,
}) => {
  const ledPositionRef = useRef<LedPositionData[] | null>(null);
  const { ws } = useConnection();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  

  const tiles: [InputTile, InputTile, InputTile] = [
    {
      key: 'hdmi',
      label: 'HDMI',
      icon: <MaterialDesignIcons name="hdmi-port" size={28} />,

      componentId: "VIDEOGRABBER",
      origin: "System",
      owner: "USB Video: USB Video (video0)",
      priority: 240,
      visible: false,
      active: false,
    },
    {
      key: 'network',
      label: 'Network',
      icon: <MaterialDesignIcons name="cloud" size={28} />,

      componentId: "COLOR",
      origin: "JsonRpc@::1",
      priority: 100,
      value: { "HSL": [], "RGB": [] },
      visible: false,
      active: false,
    },
    {
      key: 'grabber',
      label: 'Grabber',
      icon: <MaterialDesignIcons name="android" size={28} />,

      componentId: "PROTOSERVER",
      origin: "Proto@::ffff:192.168.0.118",
      priority: 50,
      visible: false,
      active: false,
    }
  ];

  // Track current selected input
  // const [currentInput, setCurrentInput] = useState<Priority | null>(null);

  const { getLedPositionData: fetchLedPosition, getCurrentActiveInput } = useLedApi();

  const getLedPositionData = async () => {
    ledPositionRef.current = await fetchLedPosition();
    return ledPositionRef.current;
  };

  const transformPosition: TransformPositionFunction = async (
    ledPositions,
    ledColorFlat,
    callbackToResetLedPositions,
    TOP_THRESHOLD = 0.05,
    BOTTOM_THRESHOLD = 0.95,
    LEFT_THRESHOLD = 0.05,
    RIGHT_THRESHOLD = 0.95
  ): Promise<TransformPositionResult> => {

    let ledPositionsCopy = ledPositions;

    const leds = [];
    const directions: directions = {
      top: [],
      bottom: [],
      left: [],
      right: [],
    };

    if (ledPositionsCopy.length != (ledColorFlat.length / 3)) {

      // console.log("hit iffff >>>>>");
      ledPositionsCopy = await callbackToResetLedPositions()
      // console.log("new leds >>>>",ledPositionsCopy.length);
    }

    for (let i = 0, j = 0; i < ledPositionsCopy.length; i++, j += 3) {
      const led = {
        ...ledPositionsCopy[i],
        color: ledColorFlat.slice(j, j + 3),
        led_ind: i,
      };
      leds.push(led);

      // Apply direction conditions
      if (0.05 < led.hmin && led.hmin < 0.95 && led.vmin <= TOP_THRESHOLD) {
        directions.top.push(led);
      }
      if (0.05 < led.hmin && led.hmin < 0.95 && led.vmax >= BOTTOM_THRESHOLD) {
        directions.bottom.push(led);
      }
      if (0.05 < led.vmin && led.vmin < 0.95 && led.hmin <= LEFT_THRESHOLD) {
        directions.left.push(led);
      }
      if (0.05 < led.vmin && led.vmin < 0.95 && led.hmax >= RIGHT_THRESHOLD) {
        directions.right.push(led);
      }
    }

    return {
      leds,
      directions,
    };
  };

  function checkTopBottomLedForFallback(topLeds: TrfLedPosition[], bottomLeds: TrfLedPosition[]): boolean {
    const noOfTopLeds = topLeds.length;
    const noOfBottomLeds = bottomLeds.length;

    if (!topLeds || !bottomLeds) {
      return false;
    }

    let topFallbackColors: { [key: string]: number } = {
      "255,255,6": 0,   // Bright yellow (slightly greenish)
      "255,0,255": 0,   // Pure magenta
      "0,10,255": 0,    // Deep blue (slightly purplish)
      "0,255,0": 0,     // Pure green
      "6,255,255": 0,   // Cyan / aqua
      "255,11,0": 0     // Bright red (slightly orange)
    };

    let bottomFallbackColors: { [key: string]: number } = {
      "255,255,6": 0,
      "255,0,255": 0,
      "0,10,255": 0,
      "0,255,0": 0,
      "6,255,255": 0,
      "255,11,0": 0
    };

    const loopTil = Math.max(noOfTopLeds, noOfBottomLeds);

    for (let ledInd = 0; ledInd < loopTil; ledInd++) {

      if (ledInd < noOfTopLeds) {
        const currTopColor = topLeds[ledInd]?.color?.join(",") ?? null;
        if (currTopColor && currTopColor in topFallbackColors) {
          topFallbackColors[currTopColor]++;
        }
      }

      if (ledInd < noOfBottomLeds) {
        const currBottomColor = bottomLeds[ledInd]?.color?.join(",") ?? null;
        if (currBottomColor && currBottomColor in bottomFallbackColors) {
          bottomFallbackColors[currBottomColor]++;
        }
      }
    }

    const minTopColorsFreq = Math.floor(noOfTopLeds * 0.09);
    const minBottomColorsFreq = Math.floor(noOfBottomLeds * 0.09);

    const areTheseTopColorsFallback = Object.values(topFallbackColors).every(
      freq => freq >= minTopColorsFreq
    );

    const areTheseBottomColorsFallback = Object.values(bottomFallbackColors).every(
      freq => freq >= minBottomColorsFreq
    );

    return areTheseTopColorsFallback && areTheseBottomColorsFallback;
  }

  const checkHdmiFallBack = async (
    ledPosition: LedPositionData[],
    ledcolors: number[]
  ): Promise<boolean | undefined> => {
    try {
      if (!ledPosition) return;

      const trfLedPosition = await transformPosition(
        ledPosition,
        ledcolors,
        getLedPositionData
      );

      const isItFallback = checkTopBottomLedForFallback(
        trfLedPosition.directions.top,
        trfLedPosition.directions.bottom
      );

      return isItFallback;
    } catch (err) {
      console.error("❌ checkHdmiFallBack failed:", err);
      return undefined; // or false depending on how you want to handle failure
    }
  };

  const decideIsSelectedComponent = (source1: string, source2: string): boolean => {
    if (source1.toLowerCase() == "color" && (source2.toLowerCase() == "color" || source2.toLowerCase() == "effect")) {
      return true
    }
    return source1.toLowerCase() == source2.toLowerCase();
  }

  const fetchCurrentInputSource = async () => {
    try {
      setLoading(true);
      const res = await getCurrentActiveInput();

      if (!res?.data || isEmptyObject(res.data)) {
        console.log("⚠️ No data available");
        return;
      }
      const priority: Priority = res.data
      if (!priority?.isFallBack) {
        setCurrentInput(priority);
      }
    } catch (error: any) {
      console.log(error.message);
      // Toast.show({
      //   type: 'error',
      //   text1: error.message ?? 'Error in Fetching Current Input',
      //   position: 'bottom',
      //   visibilityTime: 2000,
      // });
    } finally {
      setLoading(false);
    }
  };

  const loginToHyperHdr = (password: string) => {
    console.log("hyperHdr password >>>>",password);

    sendMessage({
      command: "authorize",
      subcommand: "login",
      password,
    })
  }

  useEffect(() => {
    const fetchLedData = async () => {
      try {
        await getLedPositionData();
      } catch (err) {
        console.error("❌ Failed to get LED position data:", err);
      }
    };
    fetchLedData();
    fetchCurrentInputSource()
    
    getHyperHdrLogin(loginToHyperHdr); // for mainDashboard to call if default password changed.

    loginToHyperHdr(getHyperHdrPassword());

    sendMessage({
      command: "ledcolors",
      tan: 1,
      subcommand: "ledstream-start",
    })

    sendMessage({
      command: "serverinfo",
      tan: 1,
      subscribe: ["priorities-update"],
    })

    return () => {
      sendMessage({
        command: "ledcolors",
        tan: 1,
        subcommand: "ledstream-stop",
      })
    }
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onopen = () => {
      console.log("✅ WS connected:", ws.url);
    };

    ws.onmessage = (msg) => {
      const wsResponse: WsResponse = JSON.parse(msg.data);
      handleWsResponse(wsResponse);
    };

    ws.onerror = (err) => {
      console.error("⚠️ WS error:", err);
    };

    ws.onclose = () => {
      console.log("🚪 WS closed");
    };
  }, [ws]);

  async function handleWsResponse(wsResponse: WsResponse) {

    switch (wsResponse.command) {
      case "priorities-update":

        const priorities = wsResponse.data.priorities;
        const activePriority = priorities.find(
          (p) => p.componentId !== "VIDEOGRABBER" && p.visible
        );

        if (loading) {
          return;
        }

        // console.log("ran ws res >>> handleWsResponse",activePriority);
        if (activePriority) {
          setCurrentInput(activePriority);
        } else {
          if (currentInput?.componentId !== "VIDEOGRABBER") {
            setCurrentInput(null);
          }
        }
        break;

      case "ledcolors-ledstream-update":
        // console.log("ledcolors-ledstream-update case >>");
        const flatColors = wsResponse.result.leds;

        if (loading) {
          return;
        }

        if (ledPositionRef.current) {
          const isFallback = await checkHdmiFallBack(ledPositionRef.current, flatColors);
          // console.log("falback check >>>",isFallback);

          if (isFallback !== undefined) {
            onHdmiInputChange(!isFallback);
          }

          setCurrentInput(prev => {
            if (isFallback !== undefined && !isFallback && !prev) {
              return {
                componentId: "VIDEOGRABBER",
                origin: "System",
                owner: "USB Video: USB Video (video0)",
                priority: 240,
                visible: true,
                active: false,
              };
            }

            if (isFallback && prev?.componentId === "VIDEOGRABBER") {
              return null;
            }

            return prev;
          });
        }

        break;
      
      case "config-getconfig":
        onProtoPortChange(wsResponse.info.protoServer.port)
        break;

      case "authorize":
      case "config":
        const error = wsResponse.error.toLowerCase();
        console.log("443 >>",error);
        if(error.includes("no authorization")|| error.includes("validation")) {
          console.log("login is required.")
          onUnAuthError();
        }
        break;

      case "authorize-login":
        const isLoggedInSuccessfully = wsResponse.success && wsResponse.info.token;

        console.log({isLoggedInSuccessfully}, wsResponse);

        if(isLoggedInSuccessfully) {
          sendMessage({
            command:"config", 
            tan:1,
            subcommand:"getconfig"
          })
        }
        break;
    }
  }

  const sendMessage = (msg: any) => {
    if (!ws) {
      console.warn("⚠️ No WebSocket instance, cannot send");
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      const payload = typeof msg === "string" ? msg : JSON.stringify(msg);
      ws.send(payload);
      console.log("📤 Sent:", payload);
    } else {
      console.warn("⚠️ WebSocket not open, readyState:", ws.readyState);
    }
  };

  // const disconnectWS = () => {
  //   if (wsRef.current) {
  //     wsRef.current.close();
  //     wsRef.current = null;
  //   }
  // };

  // useEffect(()=>{
  //   if(!currentInput) {
  //     return;
  //   }
  //   if(currentInput.componentId !== "VIDEOGRABBER" && isHdmiOn) {
  //     onHdmiOverride(true);
  //   } else {
  //     onHdmiOverride(false);
  //   }
  // },[isHdmiOn, currentInput])

  return (
    <View style={[styles.row, { columnGap: gap }, containerStyle]}>
      {/* Row of 3 tiles */}
      {tiles?.map((tile) => {
        const isSelected =
          currentInput &&
          decideIsSelectedComponent(tile.componentId, currentInput.componentId);

        return (
          <View
            key={tile!.key}
            style={[
              styles.box,
              {backgroundColor:theme.colors.surfaceVariant},
              commonStyles.center,
              isSelected && {backgroundColor:theme.colors.primary},
              boxStyle,
            ]}
          >
            {tile.componentId === "PROTOSERVER" && (
              <TouchableOpacity style={styles.aboutIcon} onPress={onGrabberAboutClick}>
                <MaterialDesignIcons color={theme.colors.primary} name="information" size={23} />
              </TouchableOpacity>
            )}
            <View style={[styles.content, commonStyles.center]}>
              {tile!.icon ? (
                <View style={styles.iconWrap}>
                  {React.isValidElement(tile!.icon)
                    ? React.cloneElement(
                      tile!.icon as React.ReactElement<{ style?: any }>,
                      {
                        style: [
                          (tile!.icon.props as any).style,
                          { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
                          // { color: theme.colors.onSurfaceVariant },
                        ],
                      }
                    )
                    : tile!.icon}
                </View>
              ) : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant },
                  labelStyle,
                ]}
              >
                {tile!.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

};

export default InputSourceDashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  buttonColumn: {
    flexDirection: "column",
    gap: 12,
  },
  box: {
    flex: 1,
    minHeight: 90,
    paddingVertical: 10,
    paddingHorizontal: 5,
    ...commonStyles.bRadius,
    position:"relative",
  },
  boxSelected: {
    backgroundColor: "#007BFF",
  },
  content: {
    flex: 1,
  },
  iconWrap: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0B0F14",
    textAlign: "center",
  },
  aboutIcon: {
    position:"absolute",
    right: -4,
    top: -6,
  }
});

