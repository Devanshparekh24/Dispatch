import { Alert, KeyboardAvoidingView, Platform, View, FlatList, Text, TextInput } from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import StatesButton from '../components/Buttoon/StatesButton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useCustomer from '../hooks/useCustomer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { printError } from '../utils/helper';
import { isEmpty } from '../utils/validation';
import SearchInput from '../components/Input/SearchInput'
import { COLORS } from '../constant/index'
import { useScanningContex } from '../context/ScanningContex';
import Ionicons from '@react-native-vector-icons/ionicons';
import MiniButton from '../components/Buttoon/MiniButton'
import { qrCodeScannedDataSync } from '../service/syncService';
import { Chip } from 'react-native-paper';
import isInternet from '../utils/network';
const ScanQRCodeScreen = () => {
    const [vehicle, setVehicle] = useState(null);
    const [search, setSearch] = useState('');
    const { data: customerData, refetch: customerRefetch, isRefetching } = useCustomer();
    const { currentVehicleID, setCurrentVehicleID } = useScanningContex();
    const navigation = useNavigation();
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const custData = customerData?.data;


    const handleServerSync = async () => {
        setIsSyncing(true);
        try {
            const syncResult = await qrCodeScannedDataSync();
            if (syncResult && syncResult.totalCount > 0) {
                if (syncResult.failedCount > 0) {
                    Alert.alert(
                        'Sync Partially Completed',
                        `Successfully synced ${syncResult.syncedCount} of ${syncResult.totalCount} items.\nFailed: ${syncResult.failedCount}`
                    );
                } else {
                    Alert.alert('Success', `Sync completed successfully. Synced ${syncResult.syncedCount} items.`);
                }
            } else {
                Alert.alert('Info', 'No new QR data to sync.');
            }
            customerRefetch();
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('Sync Failed', error.message || 'Unknown error');
        } finally {
            setIsSyncing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            customerRefetch();
        }, [customerRefetch])
    );
    const filterCustData = useMemo(() => {
        if (isEmpty(custData)) {
            return [];
        }

        let data = custData;

        if (search.trim()) {
            data = data.filter(item => item.CustName.toLowerCase().includes(search.toLowerCase()));
        }

        switch (selectedFilter) {
            case 'pending':
                data = data?.filter(item => item.Scanned_QR_Code < item.Total_QR_Code)
                break;
            case 'scanned':
                data = data?.filter(item => item.Scanned_QR_Code === item.Total_QR_Code)
                break;

            default:
                break;
        }

        return data;
    }, [custData, search, selectedFilter]);

    const onRefresh = () => {
        try {
            customerRefetch();
        } catch (error) {
            printError("Error in onRefresh:", error);
        }
    }
    const handleOpenScanner = (CustName, VehicleID, CustID, OrderID) => {
        if (!vehicle) {
            Alert.alert('Alert', 'Please select vehicle');
            return;
        }
        navigation.navigate('ScanQRCode', {
            vehicle: VehicleID,
            custID: CustID,
            customerName: CustName,
            OrderID: OrderID,

        });

        console.log('Navigating to ScanQRCode screen');
    }
    useEffect(() => {
        if (custData && custData.length > 0) {
            setVehicle(custData[0].VehicleID);
        }
    }, [custData]);



    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <SafeAreaView>
                <View className='px-4 pt-5 mx-4'>
                    <View className="flex-row justify-between items-center mb-5">
                        <View className="flex-row items-center">
                            <Ionicons name="person" size={20} color="#000fff" />
                            <Text className="text-xl font-semibold ml-2">
                                Customer List
                            </Text>
                        </View>


                          <View>
                            <MiniButton
                                title="Sync"
                                icon="sync"
                                disabled={isSyncing}
                                onPress={handleServerSync}
                            />
                        </View>

                    </View>
                    <View className="mt-2 mb-4 flex-row flex-wrap gap-2 px-5">
                        <Chip
                            compact
                            selected={selectedFilter === 'all'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'all' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            onPress={() => setSelectedFilter('all')}>
                            All ({custData?.length ?? 0})
                        </Chip>

                        <Chip
                            compact
                            selected={selectedFilter === 'pending'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'pending' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            onPress={() => setSelectedFilter('pending')}>
                            Pending (
                            {custData?.filter(
                                item => item.Scanned_QR_Code < item.Total_QR_Code,
                            ).length ?? 0}
                            )
                        </Chip>

                        <Chip
                            compact
                            selected={selectedFilter === 'scanned'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'scanned' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            onPress={() => setSelectedFilter('scanned')}>
                            Scanned (
                            {custData?.filter(
                                item => item.Scanned_QR_Code === item.Total_QR_Code,
                            ).length ?? 0}
                            )
                        </Chip>
                    </View>
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
                                    <View className="items-center justify-center py-14">
                                        <Text className="text-gray-400 text-sm">No Customer  available</Text>
                                    </View>
                                )
                            }
                        }
                        data={filterCustData}
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        keyboardDismissMode='on-drag'
                        // contentContainerStyle={{ paddingBottom: 100 }}
                        renderItem={({ item, index }) => {

                            const custName = item.CustName || "N/A";
                            const vehicleNo = item.VehicleID || "N/A";
                            const custID = item.CustID || "N/A";
                            const total_qty = item.Total_Qty || 0;
                            const no_of_items = item.No_of_Items || 0;
                            const total_qr_code = item.Total_QR_Code || 0;
                            const scanningQRCode = item.Scanned_QR_Code || 0;
                            const orderID = item.OrderID || item.orderID || "N/A";

                            let cardColor = COLORS.white;

                            if (scanningQRCode === 0) {
                                cardColor = COLORS.white;
                            } else if (scanningQRCode === total_qr_code) {
                                cardColor = COLORS.success;
                            } else {
                                cardColor = COLORS.warning;
                            }

                            return (
                                <>
                                    <View
                                        className="rounded-xl mb-4 shadow-lg p-4 my-2"
                                        style={{ backgroundColor: cardColor }}
                                    >
                                        <View className='flex-row justify-between items-center'>
                                            {/* Left side */}
                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text className='text-sm font-semibold'>{custName}</Text>
                                                <Text className='text-xs text-gray-600'>{vehicleNo}</Text>
                                                <Text className='text-xs text-gray-600'>{custID}</Text>
                                                <Text className='text-xs text-gray-600'>orderID :{orderID}</Text>
                                                <Text className='text-xs text-gray-600'><Text className='font-semibold'>Qty (kg) : </Text>{total_qty}</Text >
                                                <Text className='text-xs text-gray-600'><Text className='font-semibold'>No.Of.Item: </Text>{no_of_items}</Text >
                                            </View>

                                            {/* Right side - QR button */}
                                            <View style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                                                <StatesButton
                                                    bg={'bg-primary-50'}
                                                    // text={"QR Code"}
                                                    icon={"qr-code-outline"}
                                                    onPress={() => handleOpenScanner(custName, vehicleNo, custID, orderID)}
                                                />
                                            </View>

                                        </View>

                                        <View className=' mt-2 flex-row space-x-7'>
                                            <Text className='text-blue-600 text-sm font-semibold'>{total_qr_code}</Text>
                                            <Text className='text-gray-400 text-sm font-semibold'> / </Text>
                                            <Text className='text-red-500 text-sm font-bold'>{scanningQRCode}</Text>
                                        </View>
                                    </View >
                                </>
                            )
                        }}
                    />
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView >
    )
}
export default ScanQRCodeScreen;
