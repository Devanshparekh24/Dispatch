import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
const HomeScreen = () => {
  const [localUsers, setLocalUsers] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: queryResult, refetch } = useVechicle();
  const { data: customerData, refetch: refetch1 } = useCustomer();


  const logLocalUsers = async () => {
    try {
      console.log('[SQLite] Fetching local users...');
      const data = await getLocalUsers();
      setLocalUsers(data[0]);
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
      await barcodeDataSync(vehicle);
      await refetch(); // Refresh dropdown list with newly synced data from SQLite
      await refetch1();
      Alert.alert('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      printError(error);
      Alert.alert('Sync failed');
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
  }, [refetch]);


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
  const userName = localUsers.UserName
  return (
    <SafeAreaView>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >

        <View>
          <View>

            <HeaderCard
              lg_label={"Welcome Back✌"}
              md_label={userName}
            />
          </View>

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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};



export default HomeScreen;