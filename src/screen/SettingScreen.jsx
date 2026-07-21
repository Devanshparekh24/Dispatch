import { View, Text, Alert, BackHandler, ScrollView } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview';
import FullButton from '../components/Buttoon/FullButton';
import { showConfirmAlert } from '../utils/alterUtils'
import SettingItem from '../components/Buttoon/SettingItem'
import AsyncStorage from '@react-native-async-storage/async-storage';
import useDelAllData from '../hooks/useDelAllData'
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContex';
const SettingScreen = () => {
  const { setPassword } = useAuth();
  const { mutate: mutateDeleteAllData, isLoading: isLoadingDeleteAllData } = useDelAllData()
  const Version = DeviceInfo.getVersion();


  const navigation = useNavigation();
  const handleDeleteAllData = () => {
    try {
      showConfirmAlert({
        title: 'Hold on',
        message: 'Are You Sure want to Delete All Data ?',
        cancelText: 'Cancel',
        onConfirm: () => {
          mutateDeleteAllData()

        }
      })

    } catch (error) {

    }
  }

  const handleLogout = async () => {
    try {

      showConfirmAlert({
        title: 'Logout',
        message: 'Are You Sure want to Logout ?',
        cancelText: 'Cancel',
        onConfirm: () => {
          console.log("Logout Pressed")
          AsyncStorage.clear();
          BackHandler.exitApp();
        }
      })

    } catch (error) {

      console.log("🚀 ~ handleLogout ~ error:", error)
    }
  }

  const handleChangePassword = () => {
    try {
      setPassword('');
      navigation.navigate('ChangePasswordScreen');

    } catch (error) {
      console.log("🚀 ~ handleChangePassword ~ error:", error)

    }
  }

  return (
    <SafeAreaView className=' flex-1'>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >

        <SettingItem
          icon="key-outline"
          title="Change Password"
          subtitle=""
          onPress={handleChangePassword}
          
          showLoader={false}
        />
        <SettingItem
          icon="trash-bin-outline"
          title="Delete All Data"
          subtitle=""
          onPress={handleDeleteAllData}
          danger={true}
          showLoader={isLoadingDeleteAllData}
        />
        <SettingItem
          icon="log-out-outline"
          title="Log out"
          subtitle="Logout from app"
          onPress={handleLogout}
          danger={true}
          showLoader={false}
        />
        {/* App Version */}
        <View className="flex flex-col items-center">
          <Text className="text-sm text-gray-400">
            Version {Version}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>



  )
}

export default SettingScreen