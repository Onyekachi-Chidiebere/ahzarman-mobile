/**
 * @format
 */

import '@react-native-firebase/app';
import firebase from '@react-native-firebase/app';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

if (__DEV__) {
  try {
    const app = firebase.app();
    console.log('[Firebase] OK — default app initialized', {
      name: app.name,
      projectId: app.options.projectId,
      appId: app.options.appId,
      bundleId: app.options.bundleId ?? app.options.androidClientId ?? null,
    });
  } catch (e) {
    console.error(
      '[Firebase] FAILED — No Firebase App [DEFAULT]. Check GoogleService-Info.plist / google-services.json is in the native build.',
      e,
    );
  }
}

AppRegistry.registerComponent(appName, () => App);
