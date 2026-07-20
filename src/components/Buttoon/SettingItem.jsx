import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native-paper'
import Ionicons from '@react-native-vector-icons/ionicons';

const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    danger = false, 
    showLoader = false 
}) => {
    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={showLoader}
            className="px-5 py-4 flex-row items-center justify-between active:bg-gray-50"
        >
            <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Ionicons name={icon} size={22} color={danger ? '#ef4444' : '#3b82f6'} />
                </View>
                <View className="ml-4 flex-1">
                    <Text className={`text-base font-semibold ${danger ? 'text-red-600' : 'text-gray-800'}`}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-sm text-gray-500 mt-0.5">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            {showLoader ? (
                <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
                <Ionicons name="chevron-forward-outline" size={24} color="#9ca3af" />
            )}
        </TouchableOpacity>
    )
}

export default SettingItem