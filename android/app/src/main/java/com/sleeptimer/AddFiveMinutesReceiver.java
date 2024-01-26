package com.sleeptimer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.CountDownTimer;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class AddFiveMinutesReceiver extends BroadcastReceiver {
    private static ReactApplicationContext reactContext;

    public static void setReactContext(ReactApplicationContext context) {
        reactContext = context;
    }

    @Override
    public void onReceive(Context context, Intent intent) {

        // Example: Adding 5 minutes to the timer interval
        int additionalMinutes = 5;


        // Example: Adding 5 minutes to the remaining time
        long remainingTime = getBackgroundTimerRemainingTime();


        if (reactContext != null) {
            Log.v("AddFiveMinutesReceiver", "Add 5 Minutes pressed.");

            if (remainingTime > 0) {
                int newInterval = (int) (300000 + remainingTime);
                startTimerWithNewInterval(newInterval);
            }
            // You can send an event to React Native code or perform any other actions
        } else {
            Log.e("AddFiveMinutesReceiver", "ReactApplicationContext is null");
        }

    }

    private long getBackgroundTimerRemainingTime() {
        return BackgroundTimerModule.getInstance().getRemainingTime();
    }

    private void startTimerWithNewInterval(int newInterval) {
        BackgroundTimerModule.getInstance().startTimerWithInterval(newInterval);
    }

}
