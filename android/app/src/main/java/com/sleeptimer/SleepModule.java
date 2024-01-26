package com.sleeptimer;

import android.app.admin.DeviceAdminReceiver;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;

import android.media.AudioManager;
import android.media.AudioManager.OnAudioFocusChangeListener;

import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SleepModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "SleepModule";

    private DevicePolicyManager devicePolicyManager;
    private AudioManager audioManager;


    @Override
    public String getName() {
        return MODULE_NAME;
    }

    public SleepModule(ReactApplicationContext reactContext) {
        super(reactContext);
        devicePolicyManager = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
        Log.v("SleepModule","SleepModule is on.");
    }

    public void startSleep() {
            Log.v("SleepModule","SleepModule is locking the device.");
        // Request audio focus before locking the device
        requestAudioFocus();
            devicePolicyManager.lockNow();

    }

    private void requestAudioFocus() {
        audioManager = (AudioManager) getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);

        if (audioManager != null) {
            int result = audioManager.requestAudioFocus(
                    audioFocusChangeListener,
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN);

            if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                Log.v("SleepModule", "Audio focus granted");
            } else {
                Log.v("SleepModule", "Failed to request audio focus");
            }
        }
    }

    private OnAudioFocusChangeListener audioFocusChangeListener = new OnAudioFocusChangeListener() {
        @Override
        public void onAudioFocusChange(int focusChange) {
            // Handle audio focus changes if needed
        }
    };

    // ... other methods
}