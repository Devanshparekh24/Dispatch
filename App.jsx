import React, { useEffect } from 'react'
import LoginScreen from './src/auth/LoginScreen';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigationTab from './src/components/Navigation/BottomNavigationTab';
import { createUserMasterTable } from './src/service/authService';

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const initDB = async () => {
      try {
        await createUserMasterTable();
        console.log('[SQLite] Local database initialized successfully');
      } catch (error) {
        console.error('[SQLite] Database initialization failed:', error);
      }
    };
    initDB();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={BottomNavigationTab} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
export default App