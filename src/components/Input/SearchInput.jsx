import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const SearchInput = ({ value, onChangeText, placeholder = "Search..." }) => {
    return (
        <View className="mb-2 px-1">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-1 border border-gray-200">
                <Ionicons name="search" size={18} color="gray" />
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    className="flex-1 ml-2 text-xs text-gray-800 py-1"
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={() => onChangeText('')}>
                        <Ionicons name="close-circle" size={16} color="gray" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default SearchInput;
