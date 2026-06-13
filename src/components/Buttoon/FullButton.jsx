import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FullButton = ({ title, onPress, disabled }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className="bg-blue-500 py-3 px-4 rounded-lg justify-center items-center"
        >
            <Text className="text-white text-base font-semibold">{title}</Text>
        </TouchableOpacity>
    );
}



export default FullButton;
