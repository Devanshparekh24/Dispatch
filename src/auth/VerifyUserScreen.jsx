import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native'
import React from 'react'
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Applogo from '../assets/images/Dispatch_Logo.png';
import Input from '../components/Input/Input';
import FullButton from '../components/Buttoon/FullButton';
import { appHeaderName } from '../constant/HeaderName';
import { useAuth } from '../context/AuthContex';
import { useNavigation } from '@react-navigation/native';
import sendSMS from '../utils/Sms/smsService';
import { forgetPassword } from '../service/authService';

const VerifyUserScreen = () => {
    const { mobile, setMobile } = useAuth();
    const [mobileError, setMobileError] = useState('');
    const navigation = useNavigation();

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

    const handleNavigateOtpScreen = async () => {
        try {
            const response = await forgetPassword(mobile);
            if (response && response.success) {
                const generatedOtp = response.otp;
                console.log("Generated OTP:", generatedOtp);

                const result = await sendSMS(mobile, generatedOtp);
                console.log('SMS sent successfully:', result);

                navigation.navigate('VerifyOtp', {
                    mobile: mobile,
                    otp: generatedOtp
                });
                setMobile(mobile);
            } else {
                Alert.alert('Verification Failed', response?.message || 'Mobile number is not registered');
            }
        }
        catch (error) {
            console.error("handleNavigateOtpScreen error:", error);
            Alert.alert('Error', 'Failed to send SMS. Please try again.');
        }
    };
    return (
        <>
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
                                placeholder="Enter 10 digit mobile number"
                                keyboardType="phone-pad"
                                maxLength={10}
                                error={mobileError}
                            />

                            <View className='mt-4'>
                                <FullButton
                                    title="Verify Mobile No"
                                    onPress={handleNavigateOtpScreen}
                                    disabled={!mobile || Boolean(mobileError)}
                                />
                                <FullButton
                                    title="Password"
                                    onPress={() => navigation.navigate('ChangePasswordScreen')}

                                />
                            </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}

export default VerifyUserScreen