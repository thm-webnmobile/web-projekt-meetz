/**
 * @format
 */

import { AppRegistry } from 'react-native';
import './src/services/base64Polyfill';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
