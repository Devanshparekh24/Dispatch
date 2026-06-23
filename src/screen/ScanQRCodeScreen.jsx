import { ScrollView, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Camera } from 'react-native-vision-camera';
import StatesButton from '../components/Buttoon/StatesButton';
import { useNavigation } from '@react-navigation/native';

import SearchDropDown from '../components/Input/SearchDropDown';


const ScanQRCodeScreen = () => {
   const [vehicle, setVehicle] = useState(null);

    const navigation = useNavigation();

    const handleOpenScanner = () => {
        navigation.navigate('ScanQRCode');
        console.log('Navigating to ScanQRCode screen');
    }


    const data = [
        { label: 'Item 1', value: '1' },
        { label: 'Item 2', value: '2' },
        { label: 'Item 3', value: '3' },
        { label: 'Item 4', value: '4' },
        { label: 'Item 5', value: '5' },
        { label: 'Item 6', value: '6' },
        { label: 'Item 7', value: '7' },
        { label: 'Item 8', value: '8' },
    ];
    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermission();
            await Camera.requestMicrophonePermission();
        })();
    }, []);

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className='px-4 py-6'>
                <View>
                    <SearchDropDown
                        data={data}
                        value={vehicle}
                        setValue={setVehicle}
                        label="Vehicle"
                        iconName="car-outline"
                    />
                </View>
                {/* <StatesButton
                bg={'bg-primary-50'}
                text={"QR Code"}
                icon={"qr-code-outline"}
                onPress={() => handleOpenScanner()}
            /> */}
            </View>
        </ScrollView>
    )
}
export default ScanQRCodeScreen;
