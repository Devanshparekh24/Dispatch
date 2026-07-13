import { StyleSheet, View, Dimensions } from 'react-native';
import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const Map = ({ location }) => {
    // Default location (India - center) if no location is provided
    const defaultRegion = {
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 10,
        longitudeDelta: 10,
    };

    // Use actual location if available
    const region = location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }
        : defaultRegion;

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                zoomEnabled={true}
                zoomControlEnabled={true}
            // rotateEnabled={true}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Your Location"
                        description={`Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`}
                        pinColor="red"
                    />
                )}
            </MapView>
        </View>
    );
};

export default Map;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: height * 0.5,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});