/**
 * @format
 */

import 'react-native-gesture-handler';
import './global.css';
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import {
  MD2LightTheme,
  PaperProvider,
} from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { name as appName } from './app.json';
import { AuthProvider } from './src/context/AuthContex';

const queryClient = new QueryClient();

AppRegistry.registerComponent(appName, () =>
    () =>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                        <PaperProvider theme={MD2LightTheme}>
                            <App />
                        </PaperProvider>
                    </QueryClientProvider>
                </AuthProvider>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
);

