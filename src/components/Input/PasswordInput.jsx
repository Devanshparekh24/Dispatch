import React, { useState } from 'react';
import {TouchableOpacity } from 'react-native';
import { Feather as Icon } from '@react-native-vector-icons/feather';
import Input from './Input';

const PasswordInput = ({
    placeholder = 'Password',
    value,
    onChangeText,
    label = 'Password',
    error,
    ...props
}) => {

    const [showPassword, setShowPassword] = useState(true);

    return (
        <Input
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!showPassword}
            error={error}
            rightElement={
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                >
                    <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            }
            {...props}
        />
    );
};

export default PasswordInput;