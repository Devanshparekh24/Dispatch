import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalUsers } from '../service/authService';

const HomeScreen = () => {
  const [localUsers, setLocalUsers] = useState([]);
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

  useEffect(() => {
    logLocalUsers();
  }, []);

  return (
    <View>
      <Text className='text-blue-600'>{localUsers.Mobile}</Text>
    </View>
  );
};



export default HomeScreen;