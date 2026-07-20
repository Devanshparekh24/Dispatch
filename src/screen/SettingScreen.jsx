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

const SettingScreen = () => {
  const { mutate: mutateDeleteAllData, isLoading: isLoadingDeleteAllData } = useDelAllData()
  const Version = DeviceInfo.getVersion();

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
  return (
    <SafeAreaView className='bg-white flex-1'>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className=" justify-center ">
          <View className="p-4">
            <FullButton
              loading={isLoadingDeleteAllData}
              danger={true} title="Delete All Data" onPress={handleDeleteAllData} />
          </View>
        </View>
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