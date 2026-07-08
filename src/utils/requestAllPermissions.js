import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Camera} from 'react-native-vision-camera';

export const requestAllPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Vision Camera permissions
  const cameraPermission = await Camera.requestCameraPermission() ;
  const microphonePermission = await Camera.requestMicrophonePermission();

  // Android Location
  const locationPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'Dispatch App needs your location to record QR scan location.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    },
  );

  const isCameraGranted = cameraPermission === 'granted';
  const isMicrophoneGranted = microphonePermission === 'granted';
  const isLocationGranted =
    locationPermission === PermissionsAndroid.RESULTS.GRANTED;

  // All permissions granted
  if (
    isCameraGranted &&
    isMicrophoneGranted &&
    isLocationGranted
  ) {
    return true;
  }

  // Any permission permanently denied
  if (
    cameraPermission === 'denied' ||
    microphonePermission === 'denied' ||
    locationPermission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
  ) {
    Alert.alert(
      'Permissions Required',
      'Camera, Microphone and Location permissions are required to continue.',
      [
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );

    return false;
  }

  // User denied (but not permanently)
  Alert.alert(
    'Permissions Required',
    'Please allow Camera, Microphone and Location permissions.',
    [
      {
        text: 'Retry',
        onPress: async () => {
          await requestAllPermissions();
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    {cancelable: false},
  );

  return false;
};