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
import { useTotalSyncData } from '../hooks/useCustomerItemWise'
import Ionicons from '@react-native-vector-icons/ionicons';
import MiniButton from '../components/Buttoon/MiniButton'
import { qrCodeScannedDataSync } from '../service/syncService';
import { Chip } from 'react-native-paper';
import useQRCodeSync from '../hooks/useQrCodeSync';
import isInternet from '../utils/network';

const ScanQRCodeScreen = () => {
    const [vehicle, setVehicle] = useState(null);
    const [search, setSearch] = useState('');
    const { data: customerData, refetch: customerRefetch, isRefetching } = useCustomer();
    const { mutateAsync: serverSyncData, isPending: serverPending, isError } = useQRCodeSync();
    const { data: TotalSyncData, refetch: TotalSyncDataRefetch } = useTotalSyncData();
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const custData = customerData?.data;
    const navigation = useNavigation();


    const totalScannedData =
        TotalSyncData?.[0]?.ScannedQRCode || 0;

    const pendingScanne =
        TotalSyncData?.[0]?.TotalQRCode || 0;

    const handleServerSync = async () => {
        const hasInternet = await isInternet();
        if (!hasInternet) {
            Alert.alert("Info", "No internet connection.");
            return;
        }

        try {
            const result = await serverSyncData();
            console.log("🚀 ~ handleServerSync ~ result:", result)
            Alert.alert(
                'Success',
                `Synced ${result.syncedCount} of ${result.totalCount}`
            );
        }

        catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('Sync Failed', error.message || 'Unknown error');
        } finally {
            setIsSyncing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            customerRefetch();
            TotalSyncDataRefetch();
        }, [customerRefetch, TotalSyncDataRefetch])
    );
    const filterCustData = useMemo(() => {
        if (isEmpty(custData)) {
            return [];
        }

        let data = custData;
        console.log("🚀 ~ ScanQRCodeScreen ~ data:", data)

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
    const handleOpenScanner = (CustName, VehicleID, CustID, OrderID,einvoiceNo) => {
        if (!vehicle) {
            Alert.alert('Alert', 'Please select vehicle');
            return;
        }
        navigation.navigate('ScanQRCode', {
            vehicle: VehicleID,
            custID: CustID,
            customerName: CustName,
            OrderID: OrderID,
            einvoiceNo:einvoiceNo

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
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center mx-4 px-4 my-3">
                    <View className="flex-row items-center">
                        <Ionicons name="person" size={20} color="#000fff" />
                        <Text className="text-xl font-semibold ml-2">
                            Customer List
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <Text className="text-base font-semibold mr-3">
                            <Text className="text-blue-600">{totalScannedData}</Text>
                            <Text className="text-gray-500"> / </Text>
                            <Text className="text-red-500">{pendingScanne}</Text>
                        </Text>

                        <MiniButton
                            title="Sync"
                            icon="sync"
                            disabled={isSyncing}
                            loading={serverPending}
                            onPress={handleServerSync}
                            containerClassName="px-0"
                        />
                    </View>
                </View>
                <View className='flex-1 px-4 mx-4'>
                    <View className="mb-4 flex-row flex-wrap gap-2 px-2">
                        <Chip
                            compact
                            selected={selectedFilter === 'all'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'all' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            textStyle={{ fontSize: 10, fontWeight: '200' }}
                            onPress={() => setSelectedFilter('all')}>
                            All ({custData?.length ?? 0})
                        </Chip>

                        <Chip
                            textStyle={{ fontSize: 10, fontWeight: '200' }}
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
                            textStyle={{ fontSize: 10, fontWeight: '200' }}
                            compact
                            selected={selectedFilter === 'scanned'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'scanned' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            onPress={() => setSelectedFilter('scanned')}>
                            Done (
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
                            const einvoiceNo = item.EInvoice_Number || "N/A";
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
                                        className="rounded-xl mb-4 shadow-lg p-4 my-4"
                                        style={{ backgroundColor: cardColor }}
                                    >
                                        <View className='flex-row justify-between items-center'>
                                            {/* Left side */}
                                            <View style={{ flex: 1, marginRight: 12 }}>
                                                <Text className='text-sm font-semibold'>{custName}</Text>
                                                <Text className='text-xs text-gray-600'>{vehicleNo}</Text>
                                                <Text className='text-xs text-gray-600'>{custID}</Text>
                                                <Text className='text-xs text-gray-600'> Invoice No. {einvoiceNo}</Text>
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
                                                    onPress={() => {
                                                        return handleOpenScanner(custName, vehicleNo, custID, orderID, einvoiceNo);
                                                    }}
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
