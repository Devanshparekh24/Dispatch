import React, { useEffect, useState } from 'react';
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
import { Camera } from 'react-native-vision-camera';
import { isEmpty } from '../utils/validation';
import { printError } from '../utils/helper';
import { useAuth } from '../context/AuthContex';
import { useScanningContex } from '../context/ScanningContex'
import FullButton from '../components/Buttoon/FullButton';
import useSelectVehileID from '../hooks/useCurrentVehileID';

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

  const handleSync = async () => {

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
    requestLocationPermission();
    ErrorLog();
    loadData();
  }, [refetch, selectedVehileID]);


  useEffect(() => {
    (async () => {
      try {
        requestLocationPermission();
        if (Camera && typeof Camera.requestCameraPermission === 'function') {
          await Camera.requestCameraPermission();
        }
        if (Camera && typeof Camera.requestMicrophonePermission === 'function') {
          await Camera.requestMicrophonePermission();
        }
      } catch (err) {
        console.warn('Permissions request failed:', err.message);
        printError(err);

      }
    })();
  }, []);


  const onRefresh = async () => {
    try {
      await syncVechileTable();
      await Promise.all([
        refetch(),
        customerRefetch(),
        selectedVehileIDRefetch(),
      ])
    } catch (error) {
      console.error('Error refreshing vehicle table:', error);
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
                onPress={handleSync}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};



export default HomeScreen;