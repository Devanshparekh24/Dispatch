import { Alert, KeyboardAvoidingView, Platform, ScrollView, View,Dimensions, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Camera } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';
import SearchDropDown from '../components/Input/SearchDropDown';
import { Button } from 'react-native-paper';
import { syncVechileTable, barcodeDataSync } from '../service/syncService';
import useVechicle from '../hooks/useVechical';
import useCustomer from '../hooks/useCustomer';
import { SafeAreaView } from 'react-native-safe-area-context';



const ScanQRCodeScreen = () => {
    const [vehicle, setVehicle] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const navigation = useNavigation();

    const { data: queryResult, refetch } = useVechicle();
    const { data: customerData, refetch: refetch1 } = useCustomer();


 const isAndroid = Platform.OS === 'android';


    const handleOpenScanner = () => {
        if (!vehicle || !customer) {
            Alert.alert('Alert', 'Please select vehicle and customer');
            return;
        }
        navigation.navigate('ScanQRCode', {
            vehicle,
            customer
        });
        console.log('Navigating to ScanQRCode screen');
    }

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncVechileTable();
            await barcodeDataSync();
            await refetch(); // Refresh dropdown list with newly synced data from SQLite
            await refetch1();
        } catch (error) {
            console.error("🚀 ~ handleSync ~ error:", error)
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


    const custData = customerData?.data || [];
    const formattedCustomer = custData.map(item => ({
        label: item.CustName,
        value: item.CustID
    }));
    console.log("🚀 ~ ScanQRCodeScreen ~ formattedCustomer:", formattedCustomer)

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >

                <SafeAreaView>

                    <View className='px-4 py-6'>
                        <View>
                            <View className='mt-3'>
                                <SearchDropDown
                                    data={formattedVehicles}
                                    value={vehicle}
                                    setValue={setVehicle}
                                    label="Vehicle"
                                    iconName="car-outline"
                                    placeholder='select the vehicle'
                                />
                            </View>
                            <View className='mt-3'>
                                <SearchDropDown
                                    data={formattedCustomer}
                                    value={customer}
                                    setValue={setCustomer}
                                    label="Customer"
                                    iconName="person-outline"
                                    placeholder='select the customer'
                                />
                            </View>

                        </View>
                        {
                            (vehicle && customer) && (
                                <StatesButton
                                    bg={'bg-primary-50'}
                                    text={"QR Code"}
                                    icon={"qr-code-outline"}
                                    onPress={() => handleOpenScanner()}
                                />
                            )
                        }
                        <Button
                            className='mt-6'
                            mode="contained"
                            loading={isSyncing}
                            disabled={isSyncing}
                            onPress={handleSync}
                        >
                            Online to offline  Sync Data
                        </Button>
                    </View>
                </SafeAreaView>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}
export default ScanQRCodeScreen;
