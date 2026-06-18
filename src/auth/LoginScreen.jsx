import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Applogo from '../assets/images/Dispatch_Logo.png';
import { appHeaderName } from '../constant/HeaderName';
import Input from '../components/Input/Input';
import PasswordInput from '../components/Input/PasswordInput';
import FullButton from '../components/Buttoon/FullButton';
import { useNavigation } from '@react-navigation/native';
import { useAuthentication } from '../hooks/useloginCreateUser';

const LoginScreen = () => {
    const navigation = useNavigation();
    const { mutateAsync: login, isPending, isError, error } = useAuthentication();

    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            debugger;
            if (!mobile || !password) {
                Alert.alert('Error', 'Please fill in both fields');
                return;
            }
            debugger;
            const success = await login({ mobile, password });
            console.log("🚀 ~ handleLogin ~ success:", success)
            if (success) {
                navigation.navigate('Main');
            } else {
                Alert.alert('Login Failed', 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
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
                            onChangeText={setMobile}
                            placeholder="User Name" />

                        <PasswordInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter The Password" />

                        <View className='mt-4'>
                            <FullButton title="Login" onPress={handleLogin} disabled={isPending} />
                        </View>

                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
export default LoginScreen;
