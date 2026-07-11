import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native'
import React from 'react'
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Applogo from '../assets/images/Dispatch_Logo.png';
import Input from '../components/Input/Input';
import FullButton from '../components/Buttoon/FullButton';
import { appHeaderName } from '../constant/HeaderName';
import { isEmpty, isValidMobile } from '../utils/validation';
import { useAuthentication } from '../hooks/useloginCreateUser';
import { useAuth } from '../context/AuthContex';
const VerifyUser = () => {
    const { mobile, setMobile } = useAuth();
    const [mobileError, setMobileError] = useState('');
    const { mutateAsync: verifyUser } = useAuthentication();


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
                                    onPress={true}
                                    disabled={true}
                                />
                            </View>
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}

export default VerifyUser