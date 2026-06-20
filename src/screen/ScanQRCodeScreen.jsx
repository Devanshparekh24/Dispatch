import { View } from 'react-native'
import React, {  useEffect } from 'react'
import { Camera } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';

const ScanQRCodeScreen = () => {
    const navigation = useNavigation();

    const handleOpenScanner = () => {
        navigation.navigate('ScanQRCode');
        console.log('Navigating to ScanQRCode screen');
    }

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermission();
            await Camera.requestMicrophonePermission();
        })();
    }, []);

    return (

        <View className='flex-row  flex-wrap gap-4 px-4 justify-around  mt-4 mb-3'>
            {/* <Dropdown
                data={data}
                labelField="label"
                valueField="value"
                value={value}
                placeholder="Select Vehicle"
                search
                searchPlaceholder="Search..."
                onChange={item => setValue(item.value)}
                style={{
                    height: 56,
                }}
                placeholderStyle={{
                    color: '#9CA3AF',
                    fontSize: 16,
                }}
                selectedTextStyle={{
                    color: '#111827',
                    fontSize: 16,
                    fontWeight: '500',
                }}
                inputSearchStyle={{
                    height: 45,
                    borderRadius: 12,
                    borderColor: '#E5E7EB',
                    fontSize: 16,
                }}
                containerStyle={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    overflow: 'hidden',
                }}
                itemTextStyle={{
                    fontSize: 16,
                    color: '#111827',
                }}
                activeColor="#F3F4F6"
            /> */}

            <StatesButton
                bg={'bg-primary-50'}
                text={"QR Code"}
                icon={"qr-code-outline"}
                onPress={() => handleOpenScanner()}
            />
        </View>

    )
}
export default ScanQRCodeScreen;
