import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

export let isRequestingPermission = false;

export const requestLocationPermission = () => {
    return new Promise((resolve) => {
        const _request = async () => {
            if (Platform.OS === 'android') {
                try {
                    isRequestingPermission = true;
                    console.log('📍 Requesting Location Permission...');
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: 'Location Permission',
                            message: 'Attendance App needs access to your location to mark attendance.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('✅ Location permission granted');
                        resolve(true);
                    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        console.log('🚫 Location permission blocked');
                        Alert.alert(
                            'Permission Required',
                            'Location permission is required to use this app. Please enable it in settings.',
                            [
                                {
                                    text: 'Open Settings',
                                    onPress: () => {
                                        Linking.openSettings();
                                        // When returning from settings, the user needs to trigger check again.
                                        // We leave the promise pending. They can restart the action or we could add a "Done" button?
                                        // Actually, for "Ask Every Time", let's give them a Retry button alongside.
                                    }
                                },
                                {
                                    text: "Retry",
                                    onPress: () => _request()
                                }
                            ],
                            { cancelable: false }
                        );
                    } else {
                        console.log('❌ Location permission denied');
                        // Recursive loop: Ask again
                        Alert.alert(
                            'Permission Required',
                            'Location permission is required to continue.',
                            [
                                { text: 'Retry', onPress: () => _request() }
                            ],
                            { cancelable: false }
                        );
                    }
                } catch (err) {
                    console.error('Permission error:', err);
                    const errStr = err?.toString() || '';
                    if (errStr.includes('Activity') || errStr.includes('activity')) {
                        // Native Activity is not attached yet; retry silently after a short delay
                        setTimeout(() => {
                            _request();
                        }, 1000);
                        return;
                    }
                    Alert.alert(
                        'Permission Error',
                        'An error occurred while requesting permission.',
                        [
                            { text: 'Retry', onPress: () => _request() }
                        ],
                        { cancelable: false }
                    );
                } finally {
                    // Small delay to allow AppState to stabilize before releasing the lock
                    setTimeout(() => {
                        isRequestingPermission = false;
                    }, 500);
                }
            } else {
                resolve(true); // iOS assumed granted or handled elsewhere
            }
        };

        _request();
    });
};
