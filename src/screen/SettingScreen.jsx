import { View, Text } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview';

const SettingScreen = () => {
  return (
    <>

      <View>
        <Text>SettingScreen</Text>
      </View>
      {/* <WebView
        source={{ uri: 'https://www.google.com/maps/@25.8682578,77.8329516,5.83z?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={{ flex: 1 }}
      /> */}
    </>

  )
}

export default SettingScreen