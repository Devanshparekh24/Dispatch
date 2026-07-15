import { View, Text, ActivityIndicator, Linking } from 'react-native'
import React, { useCallback } from 'react'
import { WebView } from 'react-native-webview';
import useCustomer from '../hooks/useCustomer';
import { useFocusEffect } from '@react-navigation/native';
import MiniButton from '../components/Buttoon/MiniButton';

const MapwebScreen = () => {
    const { data: customerData, refetch: customerRefetch } = useCustomer();

    const custData = customerData?.data;
    console.log("🚀 ~ MapwebScreen ~ custData:", custData)

    useFocusEffect(
        useCallback(() => {
            customerRefetch();
        }, [customerRefetch])
    );

    // Filter out locations where Latitude or Longitude is null/undefined/empty
    const validCustData = custData
        ? custData.filter(c => c.Latitude && c.Longitude)
        : [];

    // Construct URL for Google Maps direction
    let url = '';
    if (validCustData.length > 0) {
        const origin = '21.1541,72.8795';
        const destination = `${validCustData[validCustData.length - 1].Latitude},${validCustData[validCustData.length - 1].Longitude}`;
        const waypoints = validCustData.slice(0, -1)
            .map(c => `${c.Latitude},${c.Longitude}`)
            .join('|');
        url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
    }

    const openGoogleMaps = () => {
        if (url) {
            Linking.openURL(url).catch(err => console.error("Couldn't open Google Maps", err));
        }
    };

    if (!custData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    if (validCustData.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#666' }}>No coordinates found for customers.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <WebView
                source={{ uri: url }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowUniversalAccessFromFileURLs
                allowFileAccess
                onShouldStartLoadWithRequest={(request) => {
                    // Let normal web urls load in the webview
                    if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
                        return true;
                    }
                    // Intercept intent:// redirections (e.g. clicking the "Start" navigation button)
                    if (request.url.startsWith('intent://')) {
                        const fallbackMatch = request.url.match(/S\.browser_fallback_url=([^;]+)/);
                        const targetUrl = fallbackMatch 
                            ? decodeURIComponent(fallbackMatch[1]) 
                            : 'https://' + request.url.substring(9).split('#Intent;')[0];
                        
                        Linking.openURL(targetUrl).catch(err => {
                            console.error("Failed to open intent URL:", err);
                        });
                        return false;
                    }
                    return false;
                }}
            />
            {url ? (
                <MiniButton icon='location' title="Open In Google Maps" onPress={openGoogleMaps} />
            ) : null}
        </View>
    )
}

export default MapwebScreen