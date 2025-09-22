import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import Svg, { Line } from "react-native-svg";
import { commonStyles } from "../styles/common";
import { useTheme } from "react-native-paper";

type NetworkDiagramProps = {
    size?: number;
    gap?: number;
};

export const NetworkDiagram: React.FC<NetworkDiagramProps> = ({
    size = 70,
    gap = 50,
}) => {
    const theme = useTheme();
    const whichDevice = Platform.OS === "android" ? "android" : "iphone";
    const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

    const handleLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerDimensions({ width, height });
    };

    // Calculate positions based on actual container dimensions
    const routerX = (containerDimensions.width+30) / 2; // Router position (center)
    const tvX = size; // TV position (left edge + half icon size)
    const phoneX = containerDimensions.width - size +10; // Phone position (right edge - half icon size)
    const setTopBoxX = containerDimensions.width / 2; // Set-top box position (center, below router)

    return (
        <View 
            style={[commonStyles.column, { gap, position: "relative" }]}
            onLayout={handleLayout}
        >
            {/* SVG for connection lines - only render when container dimensions are available */}
            {containerDimensions.width > 0 && (
                <Svg 
                    style={StyleSheet.absoluteFillObject} 
                    width={containerDimensions.width} 
                    height={containerDimensions.height}
                >
                    {/* Line from router to TV */}
                    <Line
                        x1={routerX}
                        y1={size / 1.5}
                        x2={tvX}
                        y2={size / 2}
                        stroke={theme.colors.onSurfaceVariant}
                        strokeWidth={2}
                        opacity={0.6}
                        strokeDasharray="6,6"
                    />
                    
                    {/* Line from router to phone */}
                    <Line
                        x1={routerX}
                        y1={size / 1.5}
                        x2={phoneX + 30}
                        y2={(size) / 2}
                        stroke={theme.colors.onSurfaceVariant}
                        opacity={0.6}
                        strokeWidth={2}
                        strokeDasharray="6,6"
                    />
                    
                    {/* Line from router to set-top box */}
                    <Line
                        x1={routerX}
                        y1={size / 1}
                        x2={setTopBoxX+13}
                        y2={size + gap + size / 2.5}
                        stroke={theme.colors.onSurfaceVariant}
                        strokeWidth={2}
                        opacity={0.6}
                        strokeDasharray="6,6"
                    />
                </Svg>
            )}

            <View style={[commonStyles.row, {justifyContent:"space-between", alignItems:"center"}]}>
                <MaterialIcons name="tv" color={theme.colors.onSurfaceVariant} size={size} />
                <MaterialDesignIcons name="router-wireless" color={theme.colors.onSurfaceVariant} size={size} />
                <MaterialIcons name={`phone-${whichDevice}`} color={theme.colors.onSurfaceVariant} size={size-30} style={{margin:-5}}/>
            </View>
            <View style={[commonStyles.row, { justifyContent: "center" }]}>
                <MaterialDesignIcons name="set-top-box" color={theme.colors.onSurfaceVariant} size={size} />
            </View>
        </View>
    );
};