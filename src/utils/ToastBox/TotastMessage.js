import { Platform, ToastAndroid, Alert } from 'react-native';
const ToastMessage = (message = 'Saved Successfully!') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('Success', message);
  }
};

export default ToastMessage;