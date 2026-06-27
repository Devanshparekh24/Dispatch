import { Alert, KeyboardAvoidingView, Platform, ScrollView, View, Dimensions, Linking, FlatList, Text, TextInput } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { Camera } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';
import SearchDropDown from '../components/Input/SearchDropDown';
import { barcodeDataSync } from '../service/syncService';
import useCustomer from '../hooks/useCustomer';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card/Card'
import { printError } from '../utils/helper';
import { isEmpty } from '../utils/validation';
import SearchInput from '../components/Input/SearchInput'
const ScanQRCodeScreen = () => {
    const [vehicle, setVehicle] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [search, setSearch] = useState('');
    const [customerName, setCustomerName] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const navigation = useNavigation();
    const { data: customerData, refetch: customerRefetch } = useCustomer();


    const filterCustData = useMemo(() => {
        if (!customerData?.data) {
            return [];
        }
        return customerData?.data?.filter(item => item.CustName.toLowerCase().includes(search.toLowerCase()));
    }, [customerData, search]);

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
    const custData = customerData?.data;
    useEffect(() => {
        if (custData && custData.length > 0) {
            setVehicle(custData[0].VehicleID);
        }
    }, [custData]);

    // const formattedCustomer = custData.map(item => ({
    //     label: item.CustName,
    //     value: item.CustID,
    // }));
    const selectedCustomer = custData.find(
        item => item.CustID === customer
    );
    // console.log("🚀 ~ ScanQRCodeScreen ~ formattedCustomer:", formattedCustomer)
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <SafeAreaView>
                <View className='px-4 pt-5 '>
                    <SearchInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder='search customer...'
                    />

                    <FlatList
                        keyExtractor={(item) => item.CustID}
                        ListEmptyComponent={
                            () => {
                                return (
                                    <View className="items-center justify-center py-10">
                                        <Text className="text-gray-400 text-sm">No Customer  available</Text>
                                    </View>
                                )
                            }
                        }
                        data={filterCustData}
                        keyboardDismissMode='on-drag'
                        contentContainerStyle={{ paddingBottom: 80 }}
                        renderItem={({ item, index }) => {
                            return (
                                <>
                                    <Card className="mb-4 bg-light-600">
                                        <View className='flex-row justify-between items-center'>
                                            {/* Left side */}
                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text className='text-sm font-semibold'>{item.CustName}</Text>
                                                <Text className='text-xs text-gray-600'>{item.VehicleID}</Text>
                                                <Text className='text-xs text-gray-600'>{item.CustID}</Text>
                                            </View>

                                            {/* Right side - QR button */}
                                            <View style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                                                <StatesButton
                                                    bg={'bg-primary-50'}
                                                    // text={"QR Code"}
                                                    icon={"qr-code-outline"}
                                                    onPress={() => handleOpenScanner()}
                                                />
                                            </View>

                                        </View>

                                        <View className=' mt-2 flex-row space-x-7'>
                                            <View className='items-center justify-center w-10 h-10 bg-primary-600 '>
                                                <Text className='text-white text-sm'>{item.Total_Bags}</Text>
                                            </View>
                                            <View className='items-center justify-center w-10 h-10 bg-primary-600 '>
                                                <Text className='text-white text-sm'>{item.Total_Bags}</Text>
                                            </View>
                                        </View>
                                    </Card>
                                </>
                            )
                        }}
                    />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}
export default ScanQRCodeScreen;
