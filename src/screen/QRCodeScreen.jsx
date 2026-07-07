import { View, Text, StyleSheet, TouchableOpacity, Vibration, FlatList, Alert } from 'react-native'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getCurrentLocationPromise } from '../utils/getCurrentPosition';
import BottomSheet from '../components/Sheet/BottomSheet';
import useScanQRCodeData from '../hooks/useScanQRCodeData';
import useGetScannedData from '../hooks/useGetScannedData';
import useCustomerItemWise from '../hooks/useCustomerItemWise';
import useCustomer from '../hooks/useCustomer';
import ToastMessage from '../utils/ToastBox/TotastMessage'
import { isEmpty, isValidQRCode } from '../utils/validation';
import { currentDateTime } from '../utils/TimeHelp'
import { useAuth } from '../context/AuthContex';
import useQRCodeSync from '../hooks/useQrCodeSync';
import isInternet from '../utils/network';

const QRCodeScreen = ({ route }) => {
    const [isScanned, setIsScanned] = useState(false);
    const [torch, setTorch] = useState('off');
    const [sheetIndex, setSheetIndex] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [zoom, setZoom] = useState(1);
    const baseZoom = useRef(1);
    const bottomSheetRef = useRef(null);
    const { vehicle, custID, customerName, OrderID, einvoiceNo } = route.params;
    const { userID } = useAuth();
    const device = useCameraDevice('back');
    const navigation = useNavigation();

    useEffect(() => {
        if (device) {
            setZoom(device.minZoom);
            baseZoom.current = device.minZoom;
        }
    }, [device]);
    const { mutateAsync: serverSyncData, isPending: serverPending, isError } = useQRCodeSync();
    const { mutateAsync: insertQRData, isPending: insertQRDataPending } = useScanQRCodeData();
    const { data: scannedData, refetch: refetchScannedData } = useGetScannedData();
    const { data: itemWiseData, refetch: refetchItemWiseData, isLoading: itemWiseLoading } = useCustomerItemWise(custID, vehicle);
    const { refetch: customerRefetch } = useCustomer();

    const handleGoBack = () => {
        try {
            navigation.goBack();
            customerRefetch();
        } catch (error) {

        }
    }

    const snapPoints = useMemo(() => ['25%', '50%'], []);
    useEffect(() => {
        if (device) {
            setTimeout(() => {
                bottomSheetRef.current?.present();
            }, 500);
        }
    }, [device]);

    const handleSheetChanges = useCallback((index) => {
        console.log('BottomSheet index:', index);
        setSheetIndex(index);
        // Prevent full close — snap it back open if something forces it shut
        if (index === -1) {
            requestAnimationFrame(() => {
                bottomSheetRef.current?.present();
            });
        }
    }, []);
    // 2. Configure the code scanner with a throttle/lock
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: async (codes, frame) => {
            const qrValue = codes[0]?.value;
            try {
                if (isScanned || !qrValue || isEmpty(qrValue)) {
                    return;
                }

                // Auto zoom logic like GPay
                if (codes.length > 0 && codes[0].frame && device) {
                    const code = codes[0];
                    const { width, height } = code.frame;
                    const codeSize = Math.max(width, height);
                    const frameSize = Math.min(frame.width, frame.height);
                    const ratio = codeSize / frameSize;

                    // If the QR code takes up less than 15% of the frame size, it's far away.
                    // Automatically zoom in to help the camera scan it.
                    if (ratio < 0.15 && zoom === device.minZoom) {
                        const targetZoom = Math.min(device.minZoom * 2.5, device.maxZoom);
                        console.log(`🚀 ~ Auto-zooming from ${device.minZoom} to ${targetZoom} (Ratio: ${ratio})`);
                        setZoom(targetZoom);
                        return; // Return early, let the camera zoom in on the next frames
                    }
                }

                if (!isValidQRCode(qrValue)) {
                    throw new Error('Invalid QR Code');
                }

                // 2. Lock the scanner so subsequent camera frames are ignored
                setIsScanned(true);

                Vibration.vibrate(200); // Vibrate for 500ms to give feedback to the user
                console.log('QR Code Scanned:', qrValue);
                const locationData = await getCurrentLocationPromise();

                await insertQRData({
                    OrderID: OrderID,
                    CustId: custID,
                    VehicleID: vehicle,
                    BarCode: qrValue,
                    Latitude: locationData.latitude,
                    Longitude: locationData.longitude,
                    UserID: userID,
                    EInvoice_Number: einvoiceNo,
                    CreatedAt: currentDateTime,
                });

                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                }, 2000);

                ToastMessage(qrValue.toString());
                refetchScannedData();
                refetchItemWiseData();

                const hasInternet = await isInternet();
                if (hasInternet) {
                    await serverSyncData();
                }


                // Reset scanner lock and zoom after 5 seconds of success
                setTimeout(() => {
                    setIsScanned(false);
                    if (device) setZoom(device.minZoom);
                }, 5000);

            } catch (error) {
                console.log("🚀 ~ QRCodeScreen ~ error:", error);
                Vibration.vibrate([100, 100, 100]); // Short vibration error pattern

                // Lock scanner during Alert popup, unlock and reset zoom when user clicks OK
                setIsScanned(true);
                Alert.alert("Invalid QR Code", error.message, [
                    {
                        text: "OK",
                        onPress: () => {
                            setIsScanned(false);
                            if (device) setZoom(device.minZoom);
                        }
                    }
                ]);
            }
        },
    });

    // 2. Handle loading state
    if (device == null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FFF" />
            </View>
        );
    }
    console.log("🚀 ~ QRCodeScreen ~ einvoiceNo:", einvoiceNo)
    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true} // Set to false to save battery when not focused
                photo={true} // Enable photo capture
                codeScanner={codeScanner}
                torch={torch}
                zoom={zoom}
                enableNativeZoomGesture={true}
                enableNativeTapToFocusGesture={true}
            />

            <View className='absolute top-10 w-full flex-row justify-between items-center px-5'>
                {/*  Back Btn */}
                <View className=''>
                    <TouchableOpacity
                        onPress={handleGoBack}
                        className=' bg-black p-2 rounded-full'
                    >
                        <Ionicons name='close-outline' size={25} color={'white'} />

                    </TouchableOpacity>
                </View>

                {showSuccess && (
                    <View
                        style={{
                            padding: 10,
                            borderRadius: 10,
                        }}
                    >
                        <Ionicons
                            name="checkmark-circle"
                            size={40}
                            color="#4BB543"
                        />
                    </View>
                )}
                {/* Flashlight Toggle */}
                <View className=''>
                    <TouchableOpacity
                        className=' bg-black p-2 rounded-full'
                        onPress={() => setTorch(torch === 'off' ? 'on' : 'off')}>
                        <Ionicons name={torch === 'on' ? 'flashlight' : 'flashlight-outline'}
                            size={25} color={torch === 'on' ? '#FFD700' : 'white'} />
                    </TouchableOpacity>
                </View>
            </View>
            {/* QR Overlay */}
            <View
                className={` ${sheetIndex === 0 ? 'flex justify-center items-center' : ' py-24 '}`}>
                <View style={styles.overlay}>
                    {/* Top Dark Area */}
                    <View style={styles.topOverlay} />
                    {/* Middle Section */}
                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        {/* Scanner Frame */}
                        <View style={styles.scanBox} />
                        <View style={styles.sideOverlay} />
                    </View>
                    {/* Bottom Dark Area */}
                    <View style={styles.bottomOverlay} />
                </View>
            </View>


            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={snapPoints}
                index={0}                      // always render at first snap point, not hidden
                enablePanDownToClose={false}   // block swipe-down dismiss
                enableDynamicSizing={false}    // prevents auto-collapse-to-close on content change
                onChange={handleSheetChanges}
            >
                {/* Header (Renders once at the top of the BottomSheet) */}
                <View className='px-4 pb-3 border-b border-gray-200'>
                    <Text className={`text-lg font-bold text-gray-800 ${sheetIndex === 0 ? '' : 'text-center text-sm'}`}>{customerName}</Text>
                    <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{vehicle}</Text>
                    <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{einvoiceNo}</Text>
                    {/* <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{OrderID}</Text> */}
                </View>

                {/* List of Items */}
                <FlatList
                    data={itemWiseData}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 }}
                    renderItem={({ item }) => {
                        const itemName = item.ItemName || "N/A";
                        const noOfQty = item.Total_Qty || 0;
                        const scannedQty = item.Scanned_Qty || 0;
                        const itemID = item.ItemID || "N/A";
                        return (
                            <>
                                <View className='py-2.5 flex-row justify-between items-center border-b border-gray-100'>
                                    <Text className='text-base font-medium text-gray-700'>
                                        {itemName}
                                    </Text>
                                    <Text className='text-base font-semibold text-blue-600 text-right' >
                                        {noOfQty} / {scannedQty}
                                    </Text>
                                </View>
                                <View>
                                    <Text>{itemID}</Text>
                                </View>
                            </>

                        );
                    }}
                />


            </BottomSheet>
        </View>
    )
}
export default QRCodeScreen

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    topOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },

    middleRow: {
        flexDirection: 'row',
        height: 250,
    },

    sideOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },

    scanBox: {
        width: 280,
        height: 280,
        borderWidth: 3,
        borderColor: '#fff',
        borderRadius: 20,
    },

    bottomOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.6)',
    },
}
);