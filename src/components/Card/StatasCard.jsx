import { View, Text } from 'react-native'
import React from 'react'

const StatasCard = ({ bg, color, value, label }) => {
    return (
        <>
            <View className="w-1/3 p-2">
                <View className={`${bg} rounded-xl p-4`}>
                    <Text
                        numberOfLines={1}
                        className={`${color} text-lg font-bold`}>
                        {value ?? '-'}
                    </Text>
                    <Text className="text-gray-600 text-xs mt-1">
                        {label}
                    </Text>
                </View>
            </View>
        </>
    )
}

export default StatasCard


