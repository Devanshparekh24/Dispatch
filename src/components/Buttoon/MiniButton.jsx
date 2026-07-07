import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const MiniButton = ({
  title = 'Sync Data',
  onPress,
  disabled = false,
  loading,
  icon = 'refresh',
  color = '#fff',
  containerClassName = "px-20",
}) => {
  return (
    <View className={containerClassName}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`py-2 px-3 rounded-lg flex-row justify-center items-center ${
          disabled ? 'bg-gray-400' : 'bg-blue-500'
        }`}
      >
        {loading ? (
          <ActivityIndicator color={color} />
        ) : (
          <Ionicons name={icon} size={20} color={color} />
        )}
        <Text className="text-white text-base font-semibold ml-2">
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MiniButton;