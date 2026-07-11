import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const FullButton = ({ title,
    onPress,
    disabled,
    loading,
    color = '#fff',
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`py-3 px-4 rounded-lg justify-center items-center ${disabled ? 'bg-gray-400' : 'bg-blue-500'
                }`}>
            {loading && (
                <ActivityIndicator color={color} />
            )}

            <Text className="text-white text-base font-semibold">{title}</Text>
        </TouchableOpacity>
    );
}



export default FullButton;
