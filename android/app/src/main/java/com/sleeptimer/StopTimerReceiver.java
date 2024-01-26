// StopTimerReceiver.java
package com.sleeptimer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class StopTimerReceiver extends BroadcastReceiver {

    private static ReactApplicationContext reactContext;

    public static void setReactContext(ReactApplicationContext context) {
        reactContext = context;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (reactContext != null) {
            Log.e("StopTimerReceiver", "LOG TEST.");
            // Emit an event to React Native code
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("StopTimerPressed", null);
        } else {
            Log.e("StopTimerReceiver", "ReactApplicationContext is null");
        }
    }
}