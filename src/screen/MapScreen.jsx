import { View, Text } from 'react-native'
import React from 'react'
import Map from '../components/Map/Map'
import useCustomer from '../hooks/useCustomer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

const MapScreen = () => {
    const { data: customerData, refetch: customerRefetch, isRefetching } = useCustomer();
    console.log("🚀 ~ MapScreen ~ customerData:", customerData)


    const custData = customerData?.data?.[0];
    // console.log("🚀 ~ MapScreen ~ custData:", custData)
    console.log("Lat ~ MapScreen ~ custData: ", custData.Latitude)
    console.log("Longi:", custData.Longitude)

    const navigation = useNavigation();


    useFocusEffect(
        useCallback(() => {
            customerRefetch();
        }, [customerRefetch])
    );
    return (
        <>
            <Map  markers={customerData?.data ?? []}  />
        </>
    )
}

export default MapScreen