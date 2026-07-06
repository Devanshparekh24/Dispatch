import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator,LogBox  } from 'react-native';
import LoginScreen from './src/auth/LoginScreen';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigationTab from './src/components/Navigation/BottomNavigationTab';
import initTable from './src/service/localTableinit'
import QRCodeScreen from './src/screen/QRCodeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Run database initialization and session check in parallel
        const [_, storedData] = await Promise.all([
          initTable(),
          AsyncStorage.getItem("userData")
        ]);
        console.log('App initialization tasks finished');

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.mobileNo && parsedData.userPass) {
            setInitialRoute('Main');
            return;
          }
          else {
            setInitialRoute('Login');
            return;
          }
        }

      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setInitialRoute(prev => prev || 'Login');
      }
    };

    initApp();
  }, []);

  if (initialRoute === null) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={BottomNavigationTab} />
          <Stack.Screen name="ScanQRCode" component={QRCodeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
export default App
