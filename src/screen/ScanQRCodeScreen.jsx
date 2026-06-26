import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, Dimensions, Linking, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Camera } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';
import SearchDropDown from '../components/Input/SearchDropDown';
import { barcodeDataSync } from '../service/syncService';
import useCustomer from '../hooks/useCustomer';
import { SafeAreaView } from 'react-native-safe-area-context';



const ScanQRCodeScreen = () => {
    const [vehicle, setVehicle] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [customerName, setCustomerName] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const navigation = useNavigation();

    const { data: customerData, refetch: customerRefetch } = useCustomer();
    const handleOpenScanner = () => {
        if (!vehicle) {
            Alert.alert('Alert', 'Please select vehicle');
            return;
        }
        navigation.navigate('ScanQRCode', {
            vehicle,
            customer,
            customerName: selectedCustomer?.CustName
        });

        console.log('Navigating to ScanQRCode screen');
    }

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await barcodeDataSync();
            await customerRefetch();
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


    const custData = customerData?.data || [];
    const formattedCustomer = custData.map(item => ({
        label: item.CustName,
        value: item.CustID,
    }));
    const selectedCustomer = custData.find(
        item => item.CustID === customer
    );
    console.log("🚀 ~ ScanQRCodeScreen ~ formattedCustomer:", formattedCustomer)

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <SafeAreaView>
                <View className='px-4 py-6'>
                    <View>
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
                        customer && (
                            <StatesButton
                                bg={'bg-primary-50'}
                                text={"QR Code"}
                                icon={"qr-code-outline"}
                                onPress={() => handleOpenScanner()}
                            />
                        )
                    }
                    <FlatList
                        data={[]}
                    />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}
export default ScanQRCodeScreen;
