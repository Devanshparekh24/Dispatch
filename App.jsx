import { View, Text, TextInput } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'
import DemoScreen from './src/screen/DemoScreen';
import LoginScreen from './src/auth/LoginScreen';
const queryClient = new QueryClient();
const App = () => {
  return (
    <View style={{ flex: 1 }} className='flex-1'>
      <QueryClientProvider client={queryClient}>


        <LoginScreen />
        {/* <DemoScreen /> */}
      </QueryClientProvider>
    </View>



  )
}
export default App