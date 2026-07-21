import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAndroidId } from 'react-native-device-info';
import dayjs from 'dayjs';
import { getLocalUsers } from '../service/authService';
import { getErrorLog } from '../service/Log';
import HeaderCard from '../components/Card/HeaderCard';
import SearchDropDown from '../components/Input/SearchDropDown';
import useVechicle from '../hooks/useVechical';
import useCustomer from '../hooks/useCustomer';
import { syncVechileTable, barcodeDataSync } from '../service/syncService';
import { isEmpty, kgToTones } from '../utils/validation';
import { printError } from '../utils/helper';
import { useAuth } from '../context/AuthContex';
import { useScanningContex } from '../context/ScanningContex'
import FullButton from '../components/Buttoon/FullButton';
import useSelectVehileID from '../hooks/useCurrentVehileID';
import { useTotalSyncData } from '../hooks/useCustomerItemWise'
import MiniButton from '../components/Buttoon/MiniButton';
import { useFocusEffect } from '@react-navigation/native';
import useQRCodeSync from '../hooks/useQrCodeSync';
import isInternet from '../utils/network';
import { requestAllPermissions } from '../utils/requestAllPermissions'
import Card from '../components/Card/Card'
import AppVersionUpdate from '../components/DialogeBox/AppVersionUpdate'
import StatasCard from '../components/Card/StatasCard'
import { useTotalBagData } from '../hooks/useCustomerItemWise'
import * as Progress from 'react-native-progress';
import Map from '../components/Map/Map'
import Ionicons from '@react-native-vector-icons/ionicons';
import { getBatteryLevel } from 'react-native-device-info';
import DatePickerInput from '../components/Input/DatePickerInput'

const HomeScreen = () => {
  const [localUsers, setLocalUsers] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [syncedDateText, setSyncedDateText] = useState('');

  // const loadSyncedDates = async () => {
  //   try {
  //     const from = await AsyncStorage.getItem('syncedFromDate');
  //     const to = await AsyncStorage.getItem('syncedToDate');
  //     if (from && to) {
  //       setSyncedDateText(`Offline: ${from} - ${to}`);
  //     } else {
  //       setSyncedDateText('');
  //     }
  //   } catch (e) {
  //     console.error('Error loading synced dates:', e);
  //   }
  // };
  const { mobile, setMobile, userID, setUserID, password, setPassword, userName, setUserName } = useAuth();
  const { currentVehicleID, setCurrentVehicleID } = useScanningContex();
  const { data: selectedVehileID, refetch: selectedVehileIDRefetch, isRefetching: selectedVehileIDIsRefetching } = useSelectVehileID();
  const { data: queryResult, refetch, isRefetching } = useVechicle();
  const { data: customerData, refetch: customerRefetch } = useCustomer()
  const { data: TotalSyncData, refetch: TotalSyncDataRefetch } = useTotalSyncData();
  const { mutateAsync, isPending } = useQRCodeSync();
  const { data: totalBagData, refetch: totalBagDataRefetch } = useTotalBagData();

  const logLocalUsers = async () => {
    try {
      console.log('[SQLite] Fetching local users...');
      const data = await getLocalUsers();
      if (data && data.length > 0) {
        const user = data[0];
        setLocalUsers(user);
        setUserName(user.UserName);
        setUserID(user.UserID || user.userID);
        setMobile(user.Mobile || user.mobile);
        setPassword(user.Password || user.password);


        console.log('get battery lvl', await getBatteryLevel());
        const batteryLvl = await getBatteryLevel();
        const percentage = Math.round(batteryLvl * 100)
        console.log('battery percentage', `${percentage}%`);

        const formattedVehileID = selectedVehileID[0]?.VehicleID || "";
        setCurrentVehicleID(formattedVehileID);
      }


      console.log('[SQLite] User_Local Records:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[SQLite] Error logging local users:', error);
    }
  };


  const totalScannedData =
    TotalSyncData?.[0]?.ScannedQRCode || 0;

  const pendingScanne =
    TotalSyncData?.[0]?.TotalQRCode || 0;

  const summaryItemData = totalBagData?.[0]
  // Total Bags Data
  const totalBag = summaryItemData?.TotalBag || 0;
  const totalScannBag = summaryItemData?.TotalScannedBag || 0;
  const totalPendingBag = summaryItemData?.TotalPendingBag || 0;
  const totalWeghitBag = summaryItemData?.TotalBagWeghit || 0;
  const totalScannWeghitBag = summaryItemData?.TotalScannedBagWeghit || 0;
  const totalPendingWeghitBag = summaryItemData?.TotalPendingBagWeghit || 0;
  //

  const formattedFromDate = selectedVehileID?.[0]?.FromDate || "";
  console.log("🚀 ~ logLocalUsers ~ formattedFromDate:", formattedFromDate)
  const formattedToDate = selectedVehileID?.[0]?.ToDate || "";


  let progressBagQty;

  if (totalBag > 0) {
    progressBagQty = totalScannBag / totalBag;
  }
  else {
    progressBagQty = 0;
  }

  const vehicleData = queryResult?.data || [];
  const formattedVehicles = vehicleData.map(item => ({
    label: item.VehicleID,
    value: item.VehicleID
  }));



  const ErrorLog = async () => {
    try {
      console.log('[SQLite] Fetching error logs...');
      const error_data = await getErrorLog();
      setErrorLog(error_data[0]);
      console.log('[SQLite] Error Logs:', JSON.stringify(error_data, null, 2));
    } catch (error) {
      console.error('[SQLite] Error logging error logs:', error);
    }
  };

  const handleSyncoffline = async () => {

    if (formattedFromDate && formattedToDate) {
      if (formattedFromDate < formattedToDate) {
        Alert.alert('From date should be less than or equal to To date');
        setIsSyncing(false);
        return;
      }
    }
    setIsSyncing(true);
    try {
      if (isEmpty(vehicle)) {
        Alert.alert('Vehicle not selected...');
        setIsSyncing(false);
        return;
      }
      const androidId = await getAndroidId();
      await barcodeDataSync(vehicle, androidId, userID, fromDate, toDate);
      await refetch(); // Refresh dropdown list with newly synced data from SQLite
      await selectedVehileIDRefetch()
      await TotalSyncDataRefetch()
      await totalBagDataRefetch()
      await customerRefetch()
      Alert.alert('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      printError(error);
      Alert.alert("Sync Failed", error.message);
    } finally {
      setIsSyncing(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      TotalSyncDataRefetch();
      totalBagDataRefetch();
      // loadSyncedDates();
    }, [TotalSyncDataRefetch, totalBagDataRefetch])
  )


  useEffect(() => {
    const loadData = async () => {
      try {
        await syncVechileTable();

        refetch();
      } catch (error) {
        console.error('Error syncing vehicle table on load:', error);
      }
    };

    logLocalUsers();
    ErrorLog();
    loadData();
    // loadSyncedDates();
  }, [refetch, selectedVehileID]);


  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const granted = await requestAllPermissions();

    if (!granted) {
      return;
    }

    console.log('All permissions granted');

  };


  const onRefresh = async () => {
    try {
      await syncVechileTable();

      await Promise.all([
        refetch(),
        TotalSyncDataRefetch(),
        customerRefetch(),
        selectedVehileIDRefetch(),
        totalBagDataRefetch(),
      ])
    } catch (error) {
      console.error('Error refreshing vehicle table:', error);
    }
  };


  const handleServerSync = async () => {

    const hasInternet = await isInternet();
    if (!hasInternet) {
      Alert.alert("Info", "No internet connection.");
      return;
    }
    try {
      const result = await mutateAsync();

      Alert.alert(
        'Success',
        `Synced ${result.syncedCount} of ${result.totalCount}`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View>
          <View>
            <HeaderCard
              lg_label={"Welcome Back✌"}
              md_label={userName}
              sm_label={currentVehicleID}
              xs_label={`${dayjs(formattedFromDate).format('DD-MM-YYYY')} - ${dayjs(formattedToDate).format('DD-MM-YYYY')}`} />
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <View className='mt-4 px-4 gap-3'>
                <View className=''>
                  <SearchDropDown
                    data={formattedVehicles}
                    value={vehicle}
                    setValue={setVehicle}
                    label="Vehicle"
                    iconName="car-outline"
                    placeholder='select the vehicle'
                  />
                </View>

                <View className="flex-row">
                  <View className="flex-1 mr-2">
                    <DatePickerInput
                      label="From Date"
                      value={fromDate}
                      onChange={setFromDate}
                    />
                  </View>

                  <View className="flex-1 ml-2">
                    <DatePickerInput
                      label="To Date"
                      value={toDate}
                      onChange={setToDate}
                    />
                  </View>
                </View>

                <View>
                  <FullButton
                    title="Fetch Data offline"
                    loading={isSyncing}
                    disabled={isSyncing || !vehicle}
                    onPress={handleSyncoffline}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
          <View className='px-4 py-6 gap-4'>
            <View className=''>
              <Card>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="bag" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                    <View className="flex-col">
                      <Text className="font-bold text-gray-700 text-md">Bag Scanning</Text>
                      {syncedDateText ? (
                        <Text className="text-[10px] text-gray-400 font-medium">{syncedDateText}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-base font-semibold mr-3">
                      <Text className="text-blue-600">{totalScannedData}</Text>
                      <Text className="text-gray-500"> / </Text>
                      <Text className="text-red-500">{pendingScanne}</Text>
                    </Text>
                    <View>
                      <MiniButton
                        title="Sync"
                        icon="sync"
                        disabled={isSyncing}
                        loading={isPending}
                        onPress={handleServerSync}
                        containerClassName="px-0"
                      />
                    </View>
                  </View>
                </View>
                <View className="flex-row">
                  <StatasCard
                    bg="bg-red-100"
                    color="text-red-600"
                    value={totalBag}
                    label="Total Bag"
                  />

                  <StatasCard
                    bg="bg-green-100"
                    color="text-green-600"
                    value={totalScannBag}
                    label="Scanned Bag"
                  />
                  <StatasCard
                    bg="bg-yellow-300"
                    color="text-yellow-600"
                    value={totalPendingBag}
                    label="Pending Bag"
                  />
                </View>

                {/* Progress */}
                <View className="flex-1 justify-center items-center mt-4">
                  {/* Progress Bar */}
                  <Progress.Bar
                    progress={progressBagQty}
                    width={300}          // controls width
                    height={18}          // controls thickness
                    borderRadius={15}    // controls rounded corners
                    color={'#28a745'}      // main fill color
                    unfilledColor={'#e9ecef'} // background of unfilled part
                    borderWidth={0}      // removes border
                    animation={{ type: "spring", friction: 30, tension: 500 }}
                  />

                  {/* Progress Text */}
                  <Text className="mt-2 text-lg font-semibold text-gray-700">
                    {totalScannBag} / {totalBag} ({Math.round(progressBagQty * 100)}%)
                  </Text>
                </View>
              </Card>
            </View>
            <Card>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="scale" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                  <Text className="font-bold text-gray-700 text-md">Bags Weight</Text><Text className="font-semibold text-gray-600 text-xs">{' '}(Ton)</Text>
                </View>

              </View>
              <View className="flex-row">
                <StatasCard
                  bg="bg-red-100"
                  color="text-red-600"
                  value={kgToTones(totalWeghitBag)}
                  label="Total Weghit"
                />

                <StatasCard
                  bg="bg-green-100"
                  color="text-green-600"
                  value={kgToTones(totalScannWeghitBag)}
                  label="Scanned Weghit"
                />
                <StatasCard
                  bg="bg-yellow-300"
                  color="text-yellow-600"
                  value={kgToTones(totalPendingWeghitBag)}
                  label="Pending Weghit"
                />
              </View>
            </Card>
          </View>
        </View>
        <View className='px-4'>
          <Map />
        </View>
        {/* <AppVersionUpdate /> */}
      </ScrollView>
    </SafeAreaView>

  );
};


export default HomeScreen;