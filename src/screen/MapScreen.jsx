import { View, Text } from 'react-native'
import React from 'react'
import Map from '../components/Map/Map'
import useCustomer from '../hooks/useCustomer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

const MapScreen = () => {
    const { data: customerData, refetch: customerRefetch, isRefetching } = useCustomer();
    console.log("🚀 ~ MapScreen ~ customerData:", customerData)

    const custData = customerData?.data;

    useFocusEffect(
        useCallback(() => {
            customerRefetch();
        }, [customerRefetch])
    );

    return (
        <>
            <Map markers={custData} />
        </>
    )
}

export default MapScreen