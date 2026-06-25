import { View, Text, StyleSheet, Touchable, TouchableOpacity, Vibration, Modal } from 'react-native'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react'
import { ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';

const QRCodeScreen = () => {
    const [isScanned, setIsScanned] = useState(false);
    const [torch, setTorch] = useState('off');
    const { width, height } = Dimensions.get('window');

    const device = useCameraDevice('back');
    const navigation = useNavigation();

    // 2. Configure the code scanner with a throttle/lock
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (isScanned) return; // Prevent multiple scans at once

            const qrValue = codes[0]?.value;
            if (qrValue) {
                setIsScanned(true);
                Vibration.vibrate(500); // Vibrate for 500ms to give feedback to the user
                console.log('QR Code Scanned:', qrValue);

                // Do something with the QR code data here (e.g., navigate, API call)

                // Reset scanner  5 seconds 
                setTimeout(() => setIsScanned(false), 5000);
            }
        },
    });

    // 2. Handle loading state
    if (device == null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true} // Set to false to save battery when not focused
                photo={true} // Enable photo capture
                codeScanner={codeScanner}
                torch={torch}
            />

            <View className='absolute top-10 w-full flex-row justify-between px-5'>
                {/*  Back Btn */}
                <View className=''>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className=' bg-black p-2 rounded-full'
                    >
                        <Ionicons name='close-outline' size={35} color={'white'} />

                    </TouchableOpacity>
                </View>
                {/* Flashlight Toggle */}
                <View>
                    <TouchableOpacity
                        className=' bg-black p-2 rounded-full'
                        onPress={() => setTorch(torch === 'off' ? 'on' : 'off')}>
                        <Ionicons name={torch === 'on' ? 'flashlight' : 'flashlight-outline'}
                            size={35} color={torch === 'on' ? '#FFD700' : 'white'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* QR Overlay */}
            <View className='flex items-center justify-center'>
                <View style={styles.overlay}>
                    {/* Top Dark Area */}
                    <View style={styles.topOverlay} />

                    {/* Middle Section */}
                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        {/* Scanner Frame */}
                        <View style={styles.scanBox} />
                        <View style={styles.sideOverlay} />
                    </View>
                    {/* Bottom Dark Area */}
                    <View style={styles.bottomOverlay} />
                </View>
            </View>
        </View>
    )
}

export default QRCodeScreen

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    topOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },

    middleRow: {
        flexDirection: 'row',
        height: 250,
    },

    sideOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },

    scanBox: {
        width: 280,
        height: 280,
        borderWidth: 3,
        borderColor: '#fff',
        borderRadius: 20,
    },

    bottomOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },
}
);