import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAndroidId } from 'react-native-device-info';
import { getLocalUsers } from '../service/authService';
import { requestLocationPermission } from '../utils/requestLocationPermission';
import { getErrorLog } from '../service/Log';
import HeaderCard from '../components/Card/HeaderCard';
import SearchDropDown from '../components/Input/SearchDropDown';
import useVechicle from '../hooks/useVechical';
import useCustomer from '../hooks/useCustomer';
import { Button } from 'react-native-paper';
import { syncVechileTable, barcodeDataSync } from '../service/syncService';
import { isEmpty } from '../utils/validation';
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
import AppVersionUpdate from '../components/DialogeBox/AppVersionUpdate'
const HomeScreen = () => {
  const [localUsers, setLocalUsers] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { mobile, setMobile, userID, setUserID, password, setPassword, userName, setUserName } = useAuth();
  const { currentVehicleID, setCurrentVehicleID } = useScanningContex();
  const { data: selectedVehileID, refetch: selectedVehileIDRefetch, isRefetching: selectedVehileIDIsRefetching } = useSelectVehileID();
  const { data: queryResult, refetch, isRefetching } = useVechicle();
  const { data: customerData, refetch: customerRefetch } = useCustomer()
  const { data: TotalSyncData, refetch: TotalSyncDataRefetch } = useTotalSyncData();
  const { mutateAsync, isPending } = useQRCodeSync();


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

    setIsSyncing(true);
    try {
      if (isEmpty(vehicle)) {
        Alert.alert('Vehicle not selected...');
        setIsSyncing(false);
        return;
      }
      const androidId = await getAndroidId();
      await barcodeDataSync(vehicle, androidId, userID);
      await refetch(); // Refresh dropdown list with newly synced data from SQLite
      selectedVehileIDRefetch(),

        await customerRefetch();
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
    }, [TotalSyncDataRefetch])
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
            />
          </View>
          {/* <Text className='text-red-500 text-2xl'>{currentVehicleID}</Text> */}
          <View className='px-4 py-6'>
            <View className='mb-6'>
              <SearchDropDown
                data={formattedVehicles}
                value={vehicle}
                setValue={setVehicle}
                label="Vehicle"
                iconName="car-outline"
                placeholder='select the vehicle'
              />
            </View>
            <View>
              <FullButton
                title="Offline To online Sync"
                loading={isSyncing}
                disabled={isSyncing || !vehicle}
                onPress={handleSyncoffline}
              />
            </View>
          </View>
        </View>
        <View className='px-4'>
          <View className=''>
            <Text className=' text-center'> {totalScannedData} <Text className='text-red-500'> / {pendingScanne}</Text>    </Text>
          </View>
          <MiniButton
            title="Sync"
            icon="sync"
            loading={isPending}
            disabled={isPending}
            onPress={handleServerSync}
          />
        </View>
        <AppVersionUpdate/>
      </ScrollView>
    </SafeAreaView>

  );
};


export default HomeScreen;