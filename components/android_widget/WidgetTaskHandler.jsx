// App.js
import {
  animated,
  easings,
  useSpring,
  useTransition,
} from '@react-spring/native';
import React from 'react';
import {NativeModules, View} from 'react-native';
import WidgetComponent from './WidgetComponent';
import {requestWidgetUpdate} from 'react-native-android-widget';
const {BackgroundTimerModule} = NativeModules;

const nameToWidget = {
  // SleepTimer will be the **name** with which we will reference our widget.
  SleepTimer: WidgetComponent,
};

export async function WidgetTaskHandler(props) {
  const widgetInfo = props.widgetInfo;
  console.log(widgetInfo);
  const Widget = nameToWidget[widgetInfo.widgetName];

  var timerStarted = false;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      props.renderWidget(
        <Widget
          containerWidth={widgetInfo.width}
          timerStarted={timerStarted}
        />,
      );
      break;

    case 'WIDGET_UPDATE':
      props.renderWidget(
        <Widget
          containerWidth={widgetInfo.width}
          timerStarted={timerStarted}
        />,
      );
      break;

    case 'WIDGET_RESIZED':
      props.renderWidget(
        <Widget
          containerWidth={widgetInfo.width}
          timerStarted={timerStarted}
        />,
      );
      break;

    case 'WIDGET_DELETED':
      // Not needed for now
      break;

    case 'WIDGET_CLICK':
      if (props.clickAction === 'START_TIMER') {
        const activeIndex = props.clickActionData?.activeIndex;
        console.log('Widget Timer Started');

        const minutes = parseInt(activeIndex, 10);

        if (!isNaN(minutes)) {
          const newInterval = minutes * 60000; // Convert minutes to milliseconds
          BackgroundTimerModule.updateTimerInterval(newInterval);
        }

        if (!timerStarted) {
          // Start the sleep timer with the provided activeIndex
          BackgroundTimerModule.startTimer();

          requestWidgetUpdate({
            widgetName: 'SleepTimer',
            renderWidget: () => (
              <WidgetComponent
                containerWidth={widgetInfo.width}
                timerStarted={true}
              />
            ),
            widgetNotFound: () => {
              // Called if no widget is present on the home screen
            },
          });

          timerStarted = true;
        }
      }

      if (props.clickAction === 'STOP_TIMER') {
        BackgroundTimerModule.stopTimer();
        console.log('stopping the timer from widget');
        requestWidgetUpdate({
          widgetName: 'SleepTimer',
          renderWidget: () => (
            <WidgetComponent
              containerWidth={widgetInfo.width}
              timerStarted={false}
            />
          ),
          widgetNotFound: () => {
            // Called if no widget is present on the home screen
          },
        });

        timerStarted = false;
      }
      break;

    default:
      break;
  }
}
