import React from 'react';
import { StatusBar, useColorScheme,View, Text, TouchableOpacity} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// ✅ Import your context provider
import { ConnectionProvider } from './src/api/ConnectionContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* ✅ Wrap the app in ConnectionProvider */}
        <ConnectionProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} />
        </ConnectionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const SnackbarToast = ({ text1, props }: any) => (
  <View
    style={{
      backgroundColor: '#323232',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', flex: 1 }}>{text1}</Text>

    {props?.actionLabel && (
      <TouchableOpacity onPress={props.onActionPress}>
        <Text style={{ color: '#03DAC5', fontWeight: '600', marginLeft: 12 }}>
          {props.actionLabel}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const toastConfig = {
  custom_snackbar: (props: any) => <SnackbarToast {...props} />,
};
