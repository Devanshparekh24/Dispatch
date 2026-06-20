import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from '@react-native-vector-icons/ionicons';
const StatesButton = (
    { bg = '#000fff',
        color = '#000fff',
        text = "null",
        icon = 'document-text-outline',
        onPress
    }
) => {
    return (
        <View>

            <View className=''>
                <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.7}>
                    <View className='flex-col items-center '>
                        <View className={`  ${bg} rounded-xl shadow-sm px-5 py-6 items-center  `}>
                            <Ionicons name={icon} size={40} color={color} />
                        </View>
                        <Text className='text-primary-600 text-sm font-semibold'> {text}  </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default StatesButton