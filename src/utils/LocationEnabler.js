import {
    isLocationEnabled,
    promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';

const checkLocationEnable = async () => {
    try {
        const enabled = await isLocationEnabled();
        if (!enabled) {
            await promptForEnableLocationIfNeeded();
        }
    } catch (error) {
        console.error('Warning checking/enabling location services:', error);
    }
};

export { checkLocationEnable };