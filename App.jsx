import { View, Text } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'
import DemoScreen from './src/screen/DemoScreen';
const queryClient = new QueryClient();
const App = () => {
  return (
    <View className='flex-1 items-center justify-center bg-background'>
      <QueryClientProvider client={queryClient}>
        <DemoScreen />
      </QueryClientProvider>
    </View>



  )
}
export default App