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

      <View className="bg-primary-600 shadow-md p-6 rounded-b-3xl pb-24">
        <View className='flex flex-row justify-between items-center'>

          <Text className="text-white text-2xl font-bold">
            Welcome Back ✌
          </Text>
        </View>
        {localUsers ? (
          <View className="mt-4">
            <Text className="text-white text-xl font-bold">
              <Text className='text-white'>{localUsers.UserName}</Text>
            </Text>

          </View>
        ) : (
          <Text className="text-white/70 mt-4">
            Loading...
          </Text>
        )}
      </View>
    </View>
  );
};



export default HomeScreen;