import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalUsers } from '../service/authService';
import { requestLocationPermission } from '../utils/requestLocationPermission';
import { getErrorLog } from '../service/Log';
import HeaderCard from '../components/Card/HeaderCard';
const HomeScreen = () => {
  const [localUsers, setLocalUsers] = useState([]);
  const [errorLog, setErrorLog] = useState([]);

  const logLocalUsers = async () => {
    try {
      console.log('[SQLite] Fetching local users...');
      const data = await getLocalUsers();
      console.log("🚀 ~ logLocalUsers ~ data:", data)
      setLocalUsers(data[0]);
      console.log('[SQLite] User_Local Records:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[SQLite] Error logging local users:', error);
    }
  };

  const ErrorLog = async () => {
    try {
      console.log('[SQLite] Fetching error logs...');
      const error_data = await getErrorLog();
      console.log("🚀 ~ ErrorLog ~ error_data:", error_data)
      setErrorLog(error_data[0]);
      console.log('[SQLite] Error Logs:', JSON.stringify(error_data, null, 2));
    } catch (error) {
      console.error('[SQLite] Error logging error logs:', error);
    }
  };

  useEffect(() => {
    logLocalUsers();
    requestLocationPermission();
    ErrorLog();
  }, []);
  const userName = localUsers.UserName
  return (
    <View>
      <HeaderCard
        lg_label={"Welcome Back ✌"}
        md_label={userName}
      />
    </View>
  );
};



export default HomeScreen;