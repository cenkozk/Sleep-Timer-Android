// App.js
import {
  animated,
  easings,
  useSpring,
  useTransition,
} from '@react-spring/native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  NativeModules,
  TouchableOpacity,
  DeviceEventEmitter,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import {MMKVLoader} from 'react-native-mmkv-storage';
const {BackgroundTimerModule} = NativeModules;
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome';
import WidgetPreviewComponent from './components/android_widget/WidgetPreviewComponent';
import WidgetComponent from './components/android_widget/WidgetComponent';
import {requestWidgetUpdate} from 'react-native-android-widget';

const SleepTimerApp = () => {
  const [timerLeft, setTimerLeft] = React.useState(null);

  const mmkv = new MMKVLoader().initialize();

  const [savedActiveIndex, setSavedActiveIndex] = useState(null);
  const [initialSavedActiveIndex, setInitialSavedActiveIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(
    savedActiveIndex != null ? savedActiveIndex : 14,
  );

  console.log('saved: ', savedActiveIndex, 'active: ', activeIndex);

  useEffect(() => {
    // Function to load the savedActiveIndex from MMKVStorage
    const loadSavedActiveIndex = () => {
      const savedIndex = mmkv.getString('activeIndex');
      if (savedIndex !== null) {
        if (savedActiveIndex == null) {
          setSavedActiveIndex(parseInt(savedIndex, 10));
          setInitialSavedActiveIndex(parseInt(savedIndex, 10));
          setActiveIndex(parseInt(savedIndex, 10));
        }
      } else {
        // If saved index is not assigned, set it to 14 and save
        setSavedActiveIndex(14);
        setInitialSavedActiveIndex(14);
        setActiveIndex(14);
        mmkv.setString('activeIndex', '14');
      }
    };

    // Call the function to load the saved active index
    loadSavedActiveIndex();
  }, [mmkv]);

  const handleUpdateInterval = () => {
    const minutes = activeIndex + 1;

    if (!isNaN(minutes)) {
      const newInterval = minutes * 60000; // Convert minutes to milliseconds
      BackgroundTimerModule.updateTimerInterval(newInterval);
    }
  };

  useEffect(() => {
    handleUpdateInterval();
    // Function to save the activeIndex to MMKVStorage
    const saveActiveIndex = () => {
      mmkv.setString('activeIndex', activeIndex.toString());
      setSavedActiveIndex(activeIndex);
    };

    // Call the function to save the active index whenever it changes
    saveActiveIndex();

    //Update the widget with the savedIndex

    requestWidgetUpdate({
      widgetName: 'SleepTimer',
      renderWidget: () => <WidgetComponent />,
      widgetNotFound: () => {
        // Called if no widget is present on the home screen
      },
    });
  }, [activeIndex]);

  const [isTimerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    // Listen for the timer start event
    DeviceEventEmitter.addListener('TimerStarted', () => {
      console.log('Timer started');
      setTimerRunning(true);

      //Notify the widget the timer started.
      requestWidgetUpdate({
        widgetName: 'SleepTimer',
        renderWidget: () => <WidgetComponent timerStarted={true} />,
        widgetNotFound: () => {
          // Called if no widget is present on the home screen
        },
      });
    });

    // Listen for the timer stop event
    DeviceEventEmitter.addListener('TimerStopped', () => {
      console.log('Timer stopped');
      setTimerRunning(false);
      setTimerLeft(null);

      //Notify the widget the timer stopped.
      requestWidgetUpdate({
        widgetName: 'SleepTimer',
        renderWidget: () => <WidgetComponent timerStarted={false} />,
        widgetNotFound: () => {
          // Called if no widget is present on the home screen
        },
      });
    });

    // Listen for the timer stop event
    DeviceEventEmitter.addListener('StopTimerPressed', () => {
      console.log('StopTimerPressed');
      BackgroundTimerModule.stopTimer();
      setTimerRunning(false);
      setTimerLeft(null);

      //Notify the widget the timer stopped.
      requestWidgetUpdate({
        widgetName: 'SleepTimer',
        renderWidget: () => <WidgetComponent timerStarted={false} />,
        widgetNotFound: () => {
          // Called if no widget is present on the home screen
        },
      });
    });

    DeviceEventEmitter.addListener('TimeLeft', time => {
      setTimerRunning(true);
      if (timerLeft == null) {
        setTimerLeft(time);
      }
    });
  }, []);

  const toggleTimer = () => {
    if (!isTimerRunning) {
      BackgroundTimerModule.startTimer();
    } else {
      BackgroundTimerModule.stopTimer();
      setActiveIndex(savedActiveIndex);
    }
  };

  //Anims
  const AnimatedTouchable = animated(TouchableOpacity);

  const {padding, borderRadius, backgroundColor} = useSpring({
    padding: !isTimerRunning ? 20 : 25,
    borderRadius: !isTimerRunning ? 50 : 20,
    backgroundColor: isTimerRunning ? 'rgb(239 68 68)' : 'rgb(59 130 246)',
    config: {duration: 500, easing: easings.easeInOutCubic},
  });

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const {x, y, x1, y1} = useSpring({
    from: {x: 0.5, y: 0, x1: 0.5, y1: 0.05},
    to: async next => {
      while (true) {
        await next({
          x: 0.5,
          y: 0.05,
          x1: 0.5,
          y1: -0.05,
          config: {duration: 3000, easing: easings.easeInOutSine},
        });
        await next({
          x: 0.5,
          y: 0.0,
          x1: 0.5,
          y1: 0.05,
          config: {duration: 3000, easing: easings.easeInOutSine},
        });
      }
    },
    loop: true,
  });

  const animation = useSpring({
    opacity: isTimerRunning ? 0 : 1,
    config: {duration: 500, easing: easings.easeInOutSine},
  });

  const animation1 = useSpring({
    opacity: isTimerRunning ? 1 : 0,
    config: {duration: 500, easing: easings.easeInOutSine},
  });

  return (
    <View className="flex portrait:flex-col landscape:flex-row items-center h-full landscape:justify-evenly portrait:justify-between bg-black">
      <View className=" flex flex-col p-6 rounded-3xl h-72 items-center landscape:mt-6 portrait:mt-32 justify-center ">
        <View className="relative h-full items-center">
          <animated.View
            style={animation}
            className={!isTimerRunning ? 'absolute' : 'absolute'}>
            <Text className="text-xl mb-6 text-center flex text-white font-semibold">
              Minutes:
            </Text>
            {savedActiveIndex != null ? (
              <CarouselComponent
                savedActiveIndex={savedActiveIndex}
                setActiveIndex={setActiveIndex}
                initialSavedActiveIndex={initialSavedActiveIndex}
              />
            ) : (
              <></>
            )}
          </animated.View>
          {timerLeft != null ? (
            <animated.View
              style={animation1}
              className={isTimerRunning ? 'absolute' : 'absolute'}>
              <animated.View className="flex  flex-col items-center justify-around h-full">
                <View className="flex flex-col items-center">
                  <Text className="text-4xl text-white font-extrabold">
                    {timerLeft} Minutes
                  </Text>
                  <TypingDots />
                </View>
                <View className="w-28 h-28 mt-10 flex items-center justify-center">
                  <Image
                    source={require('./assets/images/sleep.png')}
                    className="w-28 h-28"
                    style={{
                      position: 'absolute',
                    }}
                  />
                  <animated.Image
                    source={require('./assets/images/z1.png')}
                    style={{
                      width: 30,
                      height: 30,
                      position: 'absolute',
                      left: x.to(val => `${val * 100}%`),
                      top: y.to(val => `${val * 100}%`),
                    }}
                  />
                  <animated.Image
                    source={require('./assets/images/z1.png')}
                    style={{
                      width: 20,
                      height: 20,
                      position: 'absolute',
                      left: x1.to(val => `${(val + 0.3) * 100}%`),
                      top: y1.to(val => `${(val - 0.05) * 100}%`),
                    }}
                  />
                </View>
              </animated.View>
            </animated.View>
          ) : (
            <></>
          )}
        </View>
      </View>

      <View className=" flex-row justify-center portrait:mb-20 portrait:w-[80%] gap-3 items-center">
        {setActiveIndex != null ? (
          <AnimatedTouchable
            key={'button'}
            activeOpacity={0.8}
            style={{
              padding,
              borderRadius,
              backgroundColor,
            }}
            onPress={() => {
              // Stop the foreground service when the button is pressed
              toggleTimer();
            }}>
            <Text className="text-white text-center font-semibold size text-md">
              {!isTimerRunning ? 'Start Timer' : 'Stop Timer'}
            </Text>
          </AnimatedTouchable>
        ) : (
          <></>
        )}
      </View>
      <View className="absolute w-full flex items-end">
        {/* Add a button to trigger the modal */}
        <TouchableOpacity
          className="right-6 w-10 flex items-center justify-center h-10 top-6 rounded-full bg-transparent"
          onPress={toggleModal}>
          <Icon name="info" size={20} color="white" />
        </TouchableOpacity>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
          className="absolute ">
          <Pressable
            onPress={event =>
              event.target != event.currentTarget ? toggleModal() : ''
            }>
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
              }}
              className="flex flex-col p-10 justify-center items-center h-full">
              <View className="bg-zinc-800 flex flex-col items-center p-8 rounded-3xl ">
                <Text className="text-white font-medium mb-3">
                  App Information
                </Text>
                <Text className="mb-6 text-center">
                  This open-source app prioritizes your privacy, collecting no
                  user data. To function properly, it requires Device
                  Administrator and Notification access, solely for initiating
                  the device sleeping and providing timely alerts.
                </Text>

                {/* Add a button to close the modal */}
                <TouchableOpacity
                  className="bg-blue-500 p-3 rounded-3xl w-20 flex justify-start items-center"
                  onPress={toggleModal}>
                  <Text className="w-auto text-md text-white">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};

export default SleepTimerApp;

const TypingDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDots(prevDots => {
        if (prevDots.length < 4) {
          return prevDots + '.';
        } else {
          return '.';
        }
      });
    }, 1000); // Adjust the interval as needed

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View>
      <Text className="text-2xl mt-[-8] text-white font-bold">
        to sleep{dots}
      </Text>
    </View>
  );
};

const CarouselItem = React.memo(({item}) => (
  <View className="flex h-[90] items-center p-2 justify-center">
    <Text className="font-bold text-8xl flex items-center justify-center text-center h-auto text-white">
      {item}
    </Text>
  </View>
));

const CarouselComponent = ({
  savedActiveIndex,
  setActiveIndex,
  initialSavedActiveIndex,
}) => {
  const data = Array.from({length: 120}, (_, index) => index + 1);

  const renderItem = ({item, index}) => <CarouselItem item={item} />;

  const memoizedValue = useMemo(() => renderItem, [data]);

  return (
    <View className="h-[172] w-52">
      <Carousel
        data={data}
        renderItem={memoizedValue}
        listKey={(item, index) => 'D' + index.toString()}
        removeClippedSubviews={true}
        inactiveSlideOpacity={0.45}
        inactiveSlideScale={0.65}
        vertical
        getItemLayout={(data, index) => ({
          length: 90,
          offset: 90 * index,
          index,
        })}
        firstItem={initialSavedActiveIndex}
        itemHeight={90}
        sliderHeight={196}
        activeSlideAlignment="start"
        onSnapToItem={index => {
          setActiveIndex(index);
        }}
        loop={false}
      />
    </View>
  );
};
