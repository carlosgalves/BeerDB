import { ToastAndroid } from 'react-native';

const Toast = {
  show: (message, duration = ToastAndroid.SHORT, position = ToastAndroid.BOTTOM) => {
    ToastAndroid.show(message, duration, position);
  },
};

export default Toast;
