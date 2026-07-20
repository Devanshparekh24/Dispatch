import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

const FullButton = ({ title,
    onPress,
    disabled,
    danger,
    loading,
    color = '#fff',
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`py-3 px-4 rounded-lg justify-center items-center ${danger ? 'bg-red-500' : disabled ? 'bg-gray-400' : 'bg-blue-500'
                }`}>
            {loading && (
                <ActivityIndicator color={color} />
            )}

            <Text className="text-white text-base font-semibold">{title}</Text>
        </TouchableOpacity>
    );
}



export default FullButton;
