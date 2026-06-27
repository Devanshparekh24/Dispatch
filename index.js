/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import {
  MD2LightTheme,
  PaperProvider,
} from 'react-native-paper';import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { name as appName } from './app.json';
import { AuthProvider } from './src/context/AuthContex';

const queryClient = new QueryClient();

AppRegistry.registerComponent(appName, () =>
    () =>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <PaperProvider theme={MD2LightTheme}>
                    <App />
                </PaperProvider>
            </QueryClientProvider>
        </AuthProvider>

);
