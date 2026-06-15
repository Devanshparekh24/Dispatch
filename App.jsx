import React from 'react'
import LoginScreen from './src/auth/LoginScreen';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigationTab from './src/components/Navigation/BottomNavigationTab';

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useNavigationContainerRef();

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