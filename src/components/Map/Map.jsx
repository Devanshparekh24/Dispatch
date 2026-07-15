import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

const Map = ({
  markers = [],
  initialRegion,
  provider = PROVIDER_GOOGLE,
  showsUserLocation = true,
  showsMyLocationButton = true,
  markerKey = 'St_CustId',
  latitudeField = 'Latitude',
  longitudeField = 'Longitude',
  titleField = 'St_Name',
  descriptionField = 'City',
  onMarkerPress,
  children,
}) => {
  const region =
    initialRegion ||
    (markers.length > 0
      ? {
          latitude: Number(markers[0][latitudeField]),
          longitude: Number(markers[0][longitudeField]),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : DEFAULT_REGION);

  return (
    <View style={styles.container}>
      <MapView
        provider={provider}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={showsMyLocationButton}
      >
        {markers.map((item, index) => (
          <Marker
            key={item[markerKey] ?? index}
            coordinate={{
              latitude: Number(item[latitudeField]),
              longitude: Number(item[longitudeField]),
            }}
            title={item[titleField]}
            description={item[descriptionField]}
            onPress={() => onMarkerPress?.(item)}
          />
        ))}

        {children}
      </MapView>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});