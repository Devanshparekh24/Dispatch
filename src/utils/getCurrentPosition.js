import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from './requestLocationPermission';

// Get Current Location wrapped in Promise
const getCurrentLocationPromise = () => {
    return new Promise(async (resolve, reject) => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            reject(new Error('Location permission denied'));
            return;
        }

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy, speed } = position.coords;
                resolve({ latitude, longitude, accuracy, speed });
            },
            (err) => {
                console.log("Fast location failed, retrying with high accuracy...", err);
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude, accuracy, speed } = position.coords;
                        resolve({ latitude, longitude, accuracy, speed });
                    },
                    (retryErr) => {
                        reject(new Error("Unable to get location. Ensure GPS is ON."));
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0,
                        forceRequestLocation: true,
                        showLocationDialog: true,
                    }
                );
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 10000,
            }
        );
    });
};


export { getCurrentLocationPromise }