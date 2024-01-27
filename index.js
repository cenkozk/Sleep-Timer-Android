import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {WidgetTaskHandler} from './components/android_widget/WidgetTaskHandler';
import {registerWidgetTaskHandler} from 'react-native-android-widget';

AppRegistry.registerComponent(appName, () => App);
registerWidgetTaskHandler(WidgetTaskHandler);
