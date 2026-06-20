import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Camera  } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';

const ScanQRCodeScreen = () => {
    const navigation = useNavigation();

    const handleOpenScanner = () => {
        navigation.navigate('ScanQRCode');
        console.log('Navigating to ScanQRCode screen');
    }

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermission();
            await Camera.requestMicrophonePermission();
            // setHasPermission(getStartupTimeSync === 'granted');
        })();
    }, []);
  
    return (

        <View className='flex-row  flex-wrap gap-4 px-4 justify-around  mt-4 mb-3'>
            <StatesButton
                bg={'bg-primary-50'}
                text={"QR Code"}
                icon={"qr-code-outline"}
                onPress={() => handleOpenScanner()}
            />
        </View>

    )
}
export default ScanQRCodeScreen;
