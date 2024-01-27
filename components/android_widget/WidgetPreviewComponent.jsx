// App.js
import {
  animated,
  easings,
  useSpring,
  useTransition,
} from '@react-spring/native';
import React from 'react';
import {View} from 'react-native';
import {WidgetPreview, requestWidgetUpdate} from 'react-native-android-widget';
import WidgetComponent from './WidgetComponent';

const WidgetPreviewComponent = () => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <WidgetPreview
        renderWidget={() => <WidgetComponent />}
        width={160}
        height={80}
      />
    </View>
  );
};

export default WidgetPreviewComponent;
