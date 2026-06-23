import { ScrollView, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Camera } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';
import SearchDropDown from '../components/Input/SearchDropDown';
import { Button } from 'react-native-paper';
import { syncVechileTable } from '../service/syncService';
import useVechicle from '../hooks/useVechical';

const ScanQRCodeScreen = () => {
    const [vehicle, setVehicle] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const navigation = useNavigation();

    const { data: queryResult, refetch } = useVechicle();

    const handleOpenScanner = () => {
        navigation.navigate('ScanQRCode');
        console.log('Navigating to ScanQRCode screen');
    }

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncVechileTable();
            await refetch(); // Refresh dropdown list with newly synced data from SQLite
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                if (Camera && typeof Camera.requestCameraPermission === 'function') {
                    await Camera.requestCameraPermission();
                }
                if (Camera && typeof Camera.requestMicrophonePermission === 'function') {
                    await Camera.requestMicrophonePermission();
                }
            } catch (err) {
                console.warn('Permissions request failed:', err.message);
            }
        })();
    }, []);

    // Format list of vehicles from React Query cache for the Dropdown component
    const vehicleData = queryResult?.data || [];
    const formattedVehicles = vehicleData.map(item => ({
        label: item.VehicleID,
        value: item.VehicleID
    }));
    console.log("🚀 ~ ScanQRCodeScreen ~ formattedVehicles:", formattedVehicles)

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className='px-4 py-6'>
                <View>
                    <SearchDropDown
                        data={formattedVehicles}
                        value={vehicle}
                        setValue={setVehicle}
                        label="Vehicle"
                        iconName="car-outline"
                    />


                    <Button
                        mode="contained"
                        loading={isSyncing}
                        disabled={isSyncing}
                        onPress={handleSync}
                        style={{ marginTop: 15 }}
                    >
                        Sync Vehicle
                    </Button>
                </View>
                {/* <StatesButton
                bg={'bg-primary-50'}
                text={"QR Code"}
                icon={"qr-code-outline"}
                onPress={() => handleOpenScanner()}
            /> */}
            </View>
        </ScrollView>
    )
}
export default ScanQRCodeScreen;
