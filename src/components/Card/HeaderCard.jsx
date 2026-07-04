import { View, Text } from 'react-native'
import React from 'react'

const HeaderCard = ({ lg_label, md_label, sm_label }) => {
    return (
        <View>
            <View className="bg-primary-600 shadow-md p-6 rounded-b-3xl pb-24">
                <View className='flex flex-row items-center'>

                    <Text className="text-white text-2xl font-bold">
                        {lg_label}
                    </Text>
                </View>

                {md_label ? (
                    <View className="mt-4">

                        <Text className='text-xl font-bold text-white'>{md_label}</Text>

                    </View>
                ) : (
                    <Text className="text-white/70 mt-4">
                        Loading...
                    </Text>
                )}
                {
                    sm_label ? (
                        <View className="mt-4">

                            <Text className='text-xl font-bold text-white'>{sm_label}</Text>

                        </View>
                    ) : (<Text className="text-white/70 mt-4">
                        Loading...
                    </Text>)
                }
            </View>
        </View>
    )
}

export default HeaderCard