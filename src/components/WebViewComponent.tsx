import React, {useState} from 'react';
import {View, Button} from 'react-native';
import {WebView} from 'react-native-webview';

export default function WebViewComponent() {
  const [desktopMode, setDesktopMode] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0); // force remount

  const mobileUA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile Safari/604.1';
  const desktopUA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const toggleMode = () => {
    setDesktopMode(!desktopMode);
    setWebviewKey(prev => prev + 1); // force WebView remount
  };

  const injectedJS = `
  (function() {
    var meta = document.querySelector('meta[name=viewport]');
    var content;
    if (${desktopMode}) {
      // Desktop mode: scale to fit the screen width
      var screenWidth = window.innerWidth;
      var targetWidth = 1200; // width of HyperHDR desktop layout
      var scale = screenWidth / targetWidth;
      content = 'width=1200, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=yes';
    } else {
      // Mobile mode
      content = 'width=device-width, initial-scale=1.0';
    }

    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }

    window.ReactNativeWebView.postMessage("UA: " + navigator.userAgent);
  })();
  true;
`;

  return (
    <View style={{flex: 1}}>
      <Button
        title={desktopMode ? 'Switch to Mobile Mode' : 'Switch to Desktop Mode'}
        onPress={toggleMode}
      />
      <WebView
        key={webviewKey}
        source={{uri: 'https://reactnative.dev/'}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={{flex: 1}}
        userAgent={desktopMode ? desktopUA : mobileUA}
        injectedJavaScript={injectedJS}
      />
    </View>
  );
}
