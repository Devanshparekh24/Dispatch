import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react'
import FullButton from '../components/Buttoon/FullButton'
import PasswordInput from '../components/Input/PasswordInput'
import Input from '../components/Input/Input'
import { useAuth } from '../context/AuthContex';
import Applogo from '../assets/images/Dispatch_Logo.png';
import { appHeaderName } from '../constant/HeaderName';
import { useNavigation } from '@react-navigation/native';
import { isEmpty } from '../utils/validation';
import { updatePassword } from '../service/authService';

const ChangePasswordScreen = () => {
    const [passwordError, setPasswordError] = useState('');

    const navigation = useNavigation();

    const {
        mobile,
        password, setPassword,
        confrimPassword, setConfrimPassword
    } = useAuth();


    const handleUpdatePassword = async () => {
        if (String(password).trim() !== String(confrimPassword).trim()) {
            Alert.alert("Password Mismatch", "Password and Confirm Password do not match");
            setPasswordError("Password and Confirm Password do not match");
            return;
        }
        try {
            const result = await updatePassword(mobile, password);
            console.log("🚀 ~ handleUpdatePassword ~ result:", result);

            if (result.success) {
                Alert.alert(
                    "Password Updated",
                    "Password updated successfully",
                    [
                        { text: "OK", onPress: () => navigation.navigate("Login") }
                    ]
                );
            } else {
                Alert.alert("Error", result.message || "Failed to update password");
            }
        } catch (error) {
            console.log("🚀 ~ handleUpdatePassword ~ error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };
    const handlePasswordChange = (text) => {
        setPassword(text);

        if (text.length === 0) {
            setPasswordError('');
        } else if (text.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
            >
                <SafeAreaView className="flex-1 bg-[#F5F5F5]">

                    <View className="flex-1 justify-center px-6 py-8">
                        {/* Logo and Title */}
                        <View className="items-center mb-10">
                            <Image
                                source={Applogo}
                                className="w-24 h-24 mb-4"
                                resizeMode="contain"
                            />
                            <Text className="text-xl font-bold text-gray-800 mb-2">
                                Change Password
                            </Text>
                            <Text className="text-base font-semibold text-gray-600 text-center">
                                Change your password to continue to{' '}
                                <Text className="text-blue-500">{` ${appHeaderName}`} </Text>
                            </Text>
                        </View>
                        <PasswordInput
                            label="New Password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            error={passwordError}
                            placeholder="Enter The Password" />
                        <PasswordInput
                            label="Confirm Password"
                            value={confrimPassword}
                            onChangeText={setConfrimPassword}
                            placeholder="Enter The Password" />
                        <View className='mt-4'>

                            <FullButton
                                title="Change Password"
                                onPress={handleUpdatePassword}
                                disabled={isEmpty(password) || isEmpty(confrimPassword) || password.length < 6}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default ChangePasswordScreen