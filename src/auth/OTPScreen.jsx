import { View, Text, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput } from 'react-native';
import FullButton from '../components/Buttoon/FullButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import Applogo from '../assets/images/Dispatch_Logo.png';
import { forgetPassword } from '../service/authService';
import sendSMS from '../utils/Sms/smsService';

const OTPScreen = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(120);

    const inputRefs = useRef([]);
    const route = useRoute();
    const navigation = useNavigation();

    // Get mobile from navigation params for display
    const mobileNumber = route.params?.mobile;

    // Timer effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Format time (MM:SS)
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleOtpChange = (value, index) => {
        // Only accept numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        try {
            if (!mobileNumber) {
                Alert.alert('Error', 'Mobile number is missing.');
                return;
            }
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setTimer(120); // Reset timer

            const response = await forgetPassword(mobileNumber);

            if (response && response.success) {
                const newOtp = response.otp;
                Alert.alert('OTP Resent', `A new OTP has been sent.`);
                console.log("OTP Resent", newOtp);

                // Send the new OTP
                await sendSMS(mobileNumber, newOtp);

                // Update the route params with the new OTP
                navigation.setParams({ otp: newOtp });
            } else {
                Alert.alert('Error', response?.message || 'Failed to resend OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while resending OTP');
            console.error(error);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const enteredOtp = otp.join('');

            if (enteredOtp.length !== 6) {
                Alert.alert('Validation', 'Please enter a valid 6-digit OTP.');
                return;
            }

            const expectedOtp = route.params?.otp;
            console.log("Entering Verification: Entered OTP =", enteredOtp, "Expected =", expectedOtp);

            if (enteredOtp === String(expectedOtp)) {
                Alert.alert(
                    "Success",
                    "OTP Verified Successfully.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                setOtp(['', '', '', '', '', '']);
                                navigation.navigate('ChangePasswordScreen');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.log("OTP Verification Error:", error);
            Alert.alert('Error', 'An error occurred during verification.');
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
                                Verify OTP
                            </Text>
                            <Text className="text-base text-gray-600 text-center">
                                Enter the 6-digit code sent to your registered mobile number
                            </Text>
                            {mobileNumber ? (
                                <Text className="text-sm text-gray-500 mt-2 ">
                                    Sent to <Text className='font-bold text-blue-600'> {mobileNumber} </Text>
                                </Text>
                            ) : null}
                        </View>

                        {/* OTP Input Boxes */}
                        <View className="flex-row justify-center gap-3 mb-10">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    className="w-11 h-14 border border-gray-300 bg-white rounded-lg text-center text-xl font-bold text-gray-800 shadow-sm"
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    placeholder="-"
                                    placeholderTextColor="#D1D5DB"
                                    selectionColor="#3B82F6"
                                />
                            ))}
                        </View>

                        {/* Verify & Register Button Component */}
                        <View className="mt-4">
                            <FullButton
                                title="Verify OTP"
                                onPress={handleVerifyOtp}
                                disabled={otp.some(digit => digit === '')}
                            />
                        </View>

                        {/* Resend Container */}
                        <View className="flex-row justify-center items-center gap-2 mt-6">
                            <Text className="text-gray-600 text-sm">Didn't receive the code?</Text>
                            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                                <Text className={`font-semibold text-sm ${timer > 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                                    {timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default OTPScreen