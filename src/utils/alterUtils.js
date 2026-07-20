import { Alert } from 'react-native';

export const showConfirmAlert = ({
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {},
  destructive = false,
}) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
};