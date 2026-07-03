import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Applogo from '../assets/images/Dispatch_Logo.png';
import { appHeaderName } from '../constant/HeaderName';
import Input from '../components/Input/Input';
import PasswordInput from '../components/Input/PasswordInput';
import FullButton from '../components/Buttoon/FullButton';
import { useNavigation } from '@react-navigation/native';
import { useAuthentication } from '../hooks/useloginCreateUser';
import { isEmpty, isValidMobile } from '../utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage'
import saveError from '../service/Log'
import { useAuth } from '../context/AuthContex';

const LoginScreen = () => {
    const navigation = useNavigation();
    const { mobile, setMobile, password, setPassword } = useAuth();
    const { mutateAsync: login, isPending, isError, error } = useAuthentication();
    const [mobileError, setMobileError] = useState('');

    const handleForgotPassword = () => {
        try {
            navigation.navigate('ForgotPassword');
        } catch (error) {
            Alert.alert('Error', error.message);

        }
    }
    const handleMobileChange = (text) => {
        // Remove non-digit characters
        const cleaned = text.replace(/[^0-9]/g, '');

        // Only allow updating state if length is <= 10
        if (cleaned.length <= 10) {
            setMobile(cleaned);
        }

        // Live validation as the user types
        if (cleaned.length === 0) {
            setMobileError('');
        } else if (!/^[6-9]\d{9}$/.test(cleaned)) {
            setMobileError('Enter a valid 10-digit mobile number');
        } else {
            setMobileError('');
        }
    };

    const handleLogin = async () => {
        try {
            if (isEmpty(mobile) || isEmpty(password)) {
                Alert.alert('Validation', 'Please fill in both fields');
                return;
            }
            if (mobileError || !isValidMobile(mobile)) {
                Alert.alert('Validation', 'Please enter a valid 10-digit mobile number');
                return;
            }
            const success = await login({ mobile, password });
            console.log("🚀 ~ handleLogin ~ success:", success)
            if (success) {
                const userData = {
                    mobileNo: mobile,
                    userPass: password,
                };
                console.log("🚀 ~ handleLogin ~ userData:", userData)

                // STORE
                await AsyncStorage.setItem("userData", JSON.stringify(userData));
                console.log("✅ Stored in AsyncStorage");


                // READ BACK
                const storedData = await AsyncStorage.getItem("userData");
                console.log("🚀 ~ handleLogin ~ storedData:", storedData)
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    console.log("👤 Mobile:", parsedData.mobileNo);
                    console.log("🔐 Password:", parsedData.userPass);
                    navigation.replace('Main');

                } else {
                    console.log("No data found in AsyncStorage");
                    navigation.navigate('Login');
                }

            } else {
                Alert.alert('Login Failed', 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
            saveError('Login Error', error.message, 'LoginScreen');
        }
    };

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
                            <Text className="text-3xl font-bold text-gray-800 mb-2">
                                Welcome Back
                            </Text>
                            <Text className="text-base text-gray-600 text-center">
                                Sign in to continue to{' '}
                                <Text className="text-blue-500">{` ${appHeaderName}`} </Text>
                            </Text>
                        </View>
                        <Input
                            label="Mobile No"
                            value={mobile}
                            onChangeText={handleMobileChange}
                            placeholder="Mobile No"
                            keyboardType="phone-pad"
                            maxLength={10}
                            error={mobileError}
                        />

                        <PasswordInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter The Password" />

                        {/* <TouchableOpacity
                            onPress={handleForgotPassword}
                            className="self-end mt-1 mb-4"
                        // disabled={loading}
                        >
                            <Text className="text-sm font-semibold text-blue-600">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity> */}

                        <View className='mt-4'>
                            <FullButton
                                title="Login"
                                onPress={handleLogin}
                                disabled={!mobile || !password || Boolean(mobileError)}
                            />
                        </View>

                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
export default LoginScreen;
