import { View, Text, StyleSheet, TouchableOpacity, Vibration, FlatList, Alert } from 'react-native'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { ActivityIndicator, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getCurrentLocationPromise } from '../utils/getCurrentPosition';
import BottomSheet from '../components/Sheet/BottomSheet';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import useScanQRCodeData from '../hooks/useScanQRCodeData';
import useGetSyncScannedData from '../hooks/useGetSyncScannedData';
import useCustomerItemWise from '../hooks/useCustomerItemWise';
import useCustomer from '../hooks/useCustomer';
import ToastMessage from '../utils/ToastBox/TotastMessage'
import { isEmpty, isValidQRCode } from '../utils/validation';
import { currentDateTime } from '../utils/TimeHelp'
import { useAuth } from '../context/AuthContex';
import useQRCodeSync from '../hooks/useQrCodeSync';
import isInternet from '../utils/network';
import { COLORS } from '../constant';

const QRCodeScreen = ({ route }) => {
    const [isScanned, setIsScanned] = useState(false);
    const [torch, setTorch] = useState('off');
    const [sheetIndex, setSheetIndex] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('pending');
    const [showSuccess, setShowSuccess] = useState(false);
    const [zoom, setZoom] = useState(1);
    const baseZoom = useRef(1);
    const bottomSheetRef = useRef(null);
    const { customerName, custID, VehicleID, InvoNo } = route.params;
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
    const { data: scannedData, refetch: refetchScannedData } = useGetSyncScannedData();
    const { data: itemWiseData, refetch: refetchItemWiseData, isLoading: itemWiseLoading } = useCustomerItemWise(custID, VehicleID);
    console.log("🚀 ~ QRCodeScreen ~ itemWiseData:", itemWiseData)
    const { refetch: customerRefetch } = useCustomer();

    const handleGoBack = () => {
        try {
            navigation.goBack();
            customerRefetch();
        } catch (error) {
            console.log("🚀 ~ handleGoBack ~ error:", error)
        }
    }

    const snapPoints = useMemo(() => ['35%', '60%'], []);
    useEffect(() => {
        if (device) {
            setTimeout(() => {
                bottomSheetRef.current?.present();
            });
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
    const isScanningRef = useRef(false);

    // 2. Configure the code scanner with a throttle/lock
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: async (codes, frame) => {
            const qrValue = codes[0]?.value;
            try {
                if (isScanningRef.current || isScanned || !qrValue || isEmpty(qrValue)) {
                    return;
                }

                // Immediately lock synchronously
                isScanningRef.current = true;
                setIsScanned(true);

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
                        isScanningRef.current = false;
                        setIsScanned(false);
                        return; // Return early, let the camera zoom in on the next frames
                    }
                }

                if (!isValidQRCode(qrValue)) {
                    throw new Error('Invalid QR Code');
                }

                Vibration.vibrate(200); // Vibrate for 200ms to give feedback to the user
                console.log('QR Code Scanned:', qrValue);
                const locationData = await getCurrentLocationPromise();

                await insertQRData({
                    St_CustID: custID,
                    BarCode: qrValue,
                    Latitude: locationData.latitude,
                    Longitude: locationData.longitude,
                    UserID: userID,
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

                // Reset scanner lock and zoom after 2.5 seconds of success
                setTimeout(() => {
                    isScanningRef.current = false;
                    setIsScanned(false);
                    if (device) setZoom(device.minZoom);
                }, 2500);

            } catch (error) {
                console.log("🚀 ~ QRCodeScreen ~ error:", error);
                Vibration.vibrate([100, 100, 100]); // Short vibration error pattern

                // Lock scanner during Alert popup, unlock and reset zoom when user clicks OK
                isScanningRef.current = true;
                setIsScanned(true);
                Alert.alert("Invalid QR Code", error.message, [
                    {
                        text: "OK",
                        onPress: () => {
                            isScanningRef.current = false;
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

    const filteredData = itemWiseData?.filter((item) => {
        if (selectedFilter === 'pending') {
            return item.Scanned_Qty < item.no_of_Barcode;
        }

        if (selectedFilter === 'scanned') {
            return item.Scanned_Qty === item.no_of_Barcode;
        }

        return true;
    });

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
                    <Text className={`text-md font-bold text-gray-800 ${sheetIndex === 0 ? '' : 'text-center text-sm'}`}>{customerName}</Text>

                    <Text className={`text-xs font-bold text-gray-800 ${sheetIndex === 0 ? '' : 'text-center text-sm'}`}>{VehicleID}</Text>
                    <View className="mb-4 flex-row flex-wrap gap-2 px-2">
                        <Chip
                            textStyle={{ fontSize: 10, fontWeight: '200' }}
                            compact
                            selectedColor={COLORS.warning}
                            selected={selectedFilter === 'pending'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'pending' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            onPress={() => { setSelectedFilter('pending') }}>

                            Pending (
                            {itemWiseData?.filter(
                                item => item.Scanned_Qty < item.no_of_Barcode,
                            ).length ?? 0}
                            )
                        </Chip>

                        <Chip
                            textStyle={{ fontSize: 10, fontWeight: '200' }}
                            compact
                            selectedColor={COLORS.success}
                            selected={selectedFilter === 'scanned'}
                            showSelectedCheck={false}
                            icon={selectedFilter === 'scanned' ? ({ size, color }) => <Ionicons name="checkmark" size={size} color={color} /> : undefined}
                            onPress={() => { setSelectedFilter('scanned') }}>
                            Done (
                            {itemWiseData?.filter(
                                item => item.Scanned_Qty === item.no_of_Barcode,
                            ).length ?? 0}
                            )
                        </Chip>
                    </View>
                    {/* <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{InvoNo}</Text> */}
                    {/* <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{custID}</Text> */}
                    {/* <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{einvoiceID}</Text> */}
                    {/* <Text className={`text-md font-semibold text-gray-600 ${sheetIndex === 0 ? 'hidden' : 'flex'}`}>{OrderID}</Text> */}
                </View>

                {/* List of Items */}
                <BottomSheetFlatList
                    data={filteredData}
                    keyExtractor={(item, index) => item.ItemID}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 }}
                    renderItem={({ item, index }) => {
                        const itemName = item.ItemName || "N/A";
                        const noOfQty = item.no_of_Barcode || 0;
                        const scannedQty = item.Scanned_Qty || 0;
                        const itemID = item.ItemID || "N/A";
                        const packageType = item.PackingTypeName || "N/A";
                        const bagWeight = item?.BarCodeQty


                        let cardColor = COLORS.white;

                        if (scannedQty === 0) {
                            cardColor = COLORS.white;
                        } else if (noOfQty === scannedQty) {
                            cardColor = COLORS.success;
                        } else {
                            cardColor = COLORS.warning;
                        }

                        return (
                            <>
                                <View
                                    style={{ backgroundColor: cardColor }}
                                    className='py-2.5 flex-row justify-between items-center border-b border-gray-100 '>
                                    <View>


                                        <Text
                                            adjustsFontSizeToFit
                                            numberOfLines={1}
                                            minimumFontScale={0.10}
                                            className='text-base font-medium text-gray-700'>
                                            {index + 1}.{' '}{itemName}


                                        </Text>
                                        <Text className="text-xs font-semibold text-gray-500">
                                            ({packageType} x {bagWeight}Kg)
                                        </Text></View>
                                    <Text adjustsFontSizeToFit
                                        numberOfLines={1}
                                        minimumFontScale={0.10} className='text-base font-semibold text-blue-600 text-right' >
                                        {noOfQty} / {scannedQty}
                                    </Text>
                                </View>
                                {/* <View>
                                    <Text>{itemID}</Text>
                                </View> */}
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