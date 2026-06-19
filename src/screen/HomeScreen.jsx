import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalUsers } from '../service/authService';

const HomeScreen = () => {
  const logLocalUsers = async () => {
    try {
      console.log('[SQLite] Fetching local users...');
      const data = await getLocalUsers();
      console.log("🚀 ~ logLocalUsers ~ data:", data)
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
      <Text>Home</Text>
    </View>
  );
};



export default HomeScreen;