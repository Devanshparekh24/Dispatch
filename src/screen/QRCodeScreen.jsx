import { View, Text, StyleSheet, Touchable, TouchableOpacity, Vibration, Animated } from 'react-native'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { getCurrentLocationPromise } from '../utils/getCurrentPosition';
import BottomSheet from '../components/Sheet/BottomSheet';
const QRCodeScreen = ({ route }) => {
    const [isScanned, setIsScanned] = useState(false);
    const [torch, setTorch] = useState('off');
    const { vehicle, custID, customerName } = route.params;
    console.log("🚀 ~ QRCodeScreen ~ customerName:", customerName)
    console.log("🚀 ~ QRCodeScreen ~ custID:", custID)
    console.log("🚀 ~ QRCodeScreen ~ vehicle:", vehicle)


    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%'], []);

    const device = useCameraDevice('back');
    const navigation = useNavigation();

    useEffect(() => {

        if (device) {

            setTimeout(() => {

                bottomSheetRef.current?.present();
            }, 500);
        }
    }, []);

    const qrPosition = useRef(new Animated.Value(0)).current;
    const handleSheetChanges = useCallback((index) => {

        Animated.timing(qrPosition, {
            toValue: index === 2 ? -120 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
        console.log('BottomSheet index:', index);

        // Prevent full close — snap it back open if something forces it shut
        if (index === -1) {
            requestAnimationFrame(() => {
                bottomSheetRef.current?.present();
            });
        }
    }, []);
    // 2. Configure the code scanner with a throttle/lock
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: async (codes) => {
            if (isScanned) return; // Prevent multiple scans at once

            const qrValue = codes[0]?.value;
            if (qrValue) {
                setIsScanned(true);
                Vibration.vibrate(500); // Vibrate for 500ms to give feedback to the user
                console.log('QR Code Scanned:', qrValue);
                const locationData = await getCurrentLocationPromise();
                console.log("🚀 ~ QRCodeScreen ~ locationData:", locationData)

                // Open the bottom sheet
                bottomSheetRef.current?.present();

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
                enableNativeZoomGesture={true}
                enableNativeTapToFocusGesture={true}
            />

            <View className='absolute bottom-10 w-full flex-row justify-between items-center px-5'>
                {/*  Back Btn */}
                <View className=''>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className=' bg-black p-2 rounded-full'
                    >
                        <Ionicons name='close-outline' size={25} color={'white'} />

                    </TouchableOpacity>
                </View>

                {/* Flashlight Toggle */}
                <View>
                    <TouchableOpacity
                        className=' bg-black p-2 rounded-full'
                        onPress={() => setTorch(torch === 'off' ? 'on' : 'off')}>
                        <Ionicons name={torch === 'on' ? 'flashlight' : 'flashlight-outline'}
                            size={25} color={torch === 'on' ? '#FFD700' : 'white'} />
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


            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={0}                      // always render at first snap point, not hidden
                enablePanDownToClose={false}   // block swipe-down dismiss
                enableDynamicSizing={false}    // prevents auto-collapse-to-close on content change
                onChange={handleSheetChanges}
            >
                <View className='flex-row justify-center items-center px-4'>
                    <Text className='text-xl font-semibold'>{customerName}</Text>
                </View>
                <View className='flex justify-start px-4'>
                    <Text className='text-md font-semibold'>{vehicle}</Text>
                </View>
            </BottomSheet>
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