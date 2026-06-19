import React from 'react';
import { Text, TextInput, View } from 'react-native';

const Input = ({
    placeholder = 'Enter The Value',
    value,
    onChangeText,
    keyboardType = 'default',
    maxLength,
    autoCapitalize = 'none',
    autoCorrect = false,
    editable = true,
    placeholderTextColor = '#9CA3AF',
    label = 'Name',
    rightElement,
    error,
    ...props
}) => {
    return (
        <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
                {label}
            </Text>
            <View className={`flex-row items-center bg-gray-50 border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'}`}>
                <TextInput
                    className="flex-1 px-4 py-3 text-base text-gray-800"
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    keyboardType={keyboardType}
                    value={value}
                    onChangeText={onChangeText}
                    maxLength={maxLength}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    editable={editable}
                    {...props}
                />
                {rightElement && (
                    <View className="pr-4 justify-center items-center">
                        {rightElement}
                    </View>
                )}
            </View>
            {error && (
                <Text className="text-xs text-red-500 mt-1 pl-1 font-medium">
                    {error}
                </Text>
            )}
        </View>
    );
};

export default Input;