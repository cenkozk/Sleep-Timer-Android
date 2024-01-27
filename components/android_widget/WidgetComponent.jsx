// App.js
import {
  animated,
  easings,
  useSpring,
  useTransition,
} from '@react-spring/native';
import React from 'react';
import {View} from 'react-native';
import {FlexWidget, IconWidget, TextWidget} from 'react-native-android-widget';
import {MMKVLoader} from 'react-native-mmkv-storage';

const mmkv = new MMKVLoader().initialize();

const WidgetComponent = props => {
  const {containerWidth} = props;
  const {timerStarted} = props;
  console.log(containerWidth + 'px');

  var savedIndex = mmkv.getString('activeIndex');
  savedIndex = parseInt(savedIndex, 10) + 1; //0 Based index + 1
  savedIndex = savedIndex.toString();
  console.log(savedIndex + ' Widget Number');

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 999,
        flexDirection: 'row',
        display: 'flex',
        backgroundColor: '#000000',
        paddingVertical: 10,
      }}
      clickAction="OPEN_APP">
      {!timerStarted ? (
        <IconWidget
          clickAction="START_TIMER"
          clickActionData={{activeIndex: savedIndex}}
          font="material"
          size={64}
          style={{color: 'white'}}
          icon="play_circle"
        />
      ) : (
        <IconWidget
          clickAction="STOP_TIMER"
          font="material"
          size={64}
          style={{color: 'white'}}
          icon="stop_circle"
        />
      )}
      <TextWidget
        text={
          savedIndex
            ? savedIndex + (containerWidth > 220 ? ' Minutes' : ' M.')
            : 'Set the time from the app.'
        }
        click
        style={{
          fontSize: 28,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: 'white',
          paddingHorizontal: 10,
        }}
      />
    </FlexWidget>
  );
};

export default WidgetComponent;
