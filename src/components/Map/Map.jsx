    import React from 'react';
    import { StyleSheet, View, Dimensions } from 'react-native';
    import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

    const { height } = Dimensions.get('window');

    const Map = ({ markers = [] }) => {
        const defaultRegion = {
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 10,
            longitudeDelta: 10,
        };

        const region =
            markers.length > 0
                ? {
                    latitude: Number(markers[0].Latitude),
                    longitude: Number(markers[0].Longitude),
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }
                : defaultRegion;

        return (
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={region}
                    showsUserLocation
                    showsMyLocationButton
                >
                    
                    {markers.map((item) => (
                        <Marker
                            key={item.St_CustId}
                            coordinate={{
                                latitude: Number(item.Latitude),
                                longitude: Number(item.Longitude),
                            }}
                            title={item.St_Name}
                            description={item.City}
                        />
                    ))}
                </MapView>

                
            </View>
        );
    };

    export default Map;

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: '100%',
        },
        map: {
            flex: 1,
        },
    });