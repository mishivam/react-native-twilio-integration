/* eslint-disable prettier/prettier */
import {Alert, Platform} from 'react-native';
import {checkMultiple, request, RESULTS} from 'react-native-permissions';

export default async (iosPermission, androidPermission) => {
  const permissionGranted = [];
  const isIOS = Platform.OS === 'ios';
  const permissions = isIOS ? [...iosPermission] : [...androidPermission];

  const permissionStatus = await checkMultiple(permissions);

  for (let permission of permissions) {
    if (permissionStatus[permission] === RESULTS.UNAVAILABLE) {
      Alert.alert('Error', 'Hardware to support video calls is not available!');
    } else if (permissionStatus[permission] === RESULTS.BLOCKED) {
      Alert.alert(
        'Blocked',
        'This permission was blocked, please grant permission manually!',
      );
    } else if (permissionStatus[permission] === RESULTS.DENIED) {
      const status = await request(permission);

      if (status[permission] !== RESULTS.GRANTED) {
        Alert.alert(
          'Denied',
          'This permission is required, please grant permission!',
        );
      }
    } else if (permissionStatus[permission] === RESULTS.DENIED) {
      const status = await request(permission);

      if (status !== RESULTS.DENIED) {
        Alert.alert(
          'Denied',
          'This permission is required, please grant permission!',
        );
        permissionGranted.push(false);
      }
    } else if (permissionStatus[permission] === RESULTS.GRANTED) {
      permissionGranted.push(true);
    }
  }

  permissionGranted.forEach(status => {
    // if any of the permission is not granted....
    if (!status) {
      return false;
    }
  });

  return true;
};
