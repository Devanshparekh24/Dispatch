import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import FullButton from '../components/Buttoon/FullButton';
import { ActivityIndicator } from 'react-native-paper';
import { getStartupTimeSync } from 'react-native-device-info';


const ScanQRCodeScreen = () => {
const [isScanned, setIsScanned] = useState(false);


    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermission();
            await Camera.requestMicrophonePermission();
            // setHasPermission(getStartupTimeSync === 'granted');
        })();
    }, []);
    const device = useCameraDevice('back');
    // 2. Configure the code scanner with a throttle/lock
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (isScanned) return; // Prevent multiple scans at once
            
            const qrValue = codes[0]?.value;
            if (qrValue) {
                setIsScanned(true); 
                console.log('QR Code Scanned:', qrValue);
                
                // Do something with the QR code data here (e.g., navigate, API call)
                
                // Reset scanner after 3 seconds so the user can scan again if needed
                setTimeout(() => setIsScanned(false), 3000);
            }
        },
    });
    


    // 2. Handle loading state
    if (device == null ) {
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

            />

           <FullButton
           title={'Open QR Scanner'}
           onPress={()=>{}}
           />

        </View>
    )
}

export default ScanQRCodeScreen;
const styles = StyleSheet.create({
    container: { flex: 1/2, backgroundColor: 'black' },
});