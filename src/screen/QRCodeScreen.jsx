import { View, Text, StyleSheet } from 'react-native'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

import React, { useState } from 'react'
import { ActivityIndicator } from 'react-native-paper';

const QRCodeScreen = () => {
    const [isScanned, setIsScanned] = useState(false);
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
            />
        </View>
    )
}

export default QRCodeScreen

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
});