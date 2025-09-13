import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { commonStyles } from '../styles/common';
import Toast from 'react-native-toast-message';
import { useLedApi } from '../api/ledApi';
import { useTheme, Text } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';


const BrightnessSlider = () => {
    const {adjustLedBrightness, getLedBrightness} = useLedApi();
    
    const [brightness, setBrightness] = useState(50);
    const theme = useTheme();

    const handleBrightnessChange = async (value: number): Promise<void> => {
        try {
            await adjustLedBrightness(value);
        } catch (error: any) {
            Toast.show({
                type: 'error',           // success | error | info
                text1: error.message ?? 'error in setting Brightness',
                position: 'bottom',
                visibilityTime: 2000,
            });
        }
    };

    const fetchLedBrightness = async (): Promise<void> => {
        try {
            const res = await getLedBrightness()
            setBrightness(res.data.brightness)
        } catch(error:any) {
            Toast.show({
                type: 'error',           // success | error | info
                text1: error.message ?? 'Error in fetching Brightness',
                position: 'bottom',
                visibilityTime: 2000,
            });
        }
    }

    useEffect(()=>{
        fetchLedBrightness()
    },[])

    return (
        <View style={[styles.container,{backgroundColor:theme.colors.surfaceVariant}]}>
            <View style={[styles.sliderRow, commonStyles.row]}>
                <Slider
                    style={{ flex: 1, height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={brightness}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.onSurface}
                    thumbTintColor={theme.colors.primary}
                    onValueChange={(value) => setBrightness(value)}
                    onSlidingComplete={(value) => { handleBrightnessChange(value) }}
                />
                {/* Fixed-width tooltip */}
                <View style={[styles.tooltip, commonStyles.center,{backgroundColor:theme.colors.primary}]}>
                    <Text style={[styles.tooltipText, {color: theme.colors.onPrimary} ]}>{brightness}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 10,
        paddingBottom: 10,
        width: '100%',
        ...commonStyles.bRadius,
    },
    sliderRow: {
        paddingRight: 10,
    },
    tooltip: {
        marginLeft: 12,
        width: 40,
        height: 30,
        backgroundColor: '#007BFF',
        borderRadius: 8,
    },
    tooltipText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center', // center the number
    },
});

export default BrightnessSlider;
