// BackgroundTimerModule.java

package com.sleeptimer; // Replace with your actual package name

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.admin.DeviceAdminReceiver;
import android.app.admin.DevicePolicyManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.os.Build;
import android.os.CountDownTimer;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.content.Intent;
import android.os.Parcelable;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.util.Log;


public class BackgroundTimerModule extends ReactContextBaseJavaModule {

    private static final String CHANNEL_ID = "BackgroundTimerChannel";
    private static final int NOTIFICATION_ID = 1;
    private long timerInterval = 5000; // 5 seconds

    private CountDownTimer countDownTimer;
    private long remainingTime;

    private static BackgroundTimerModule instance;

    private SleepModule sleepModule;

    private DevicePolicyManager devicePolicyManager;
    private static final int DEVICE_ADMIN_REQUEST = 1234;

    private ComponentName adminComponent;

    private ReactApplicationContext reactContextApp;

    public BackgroundTimerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContextApp = reactContext;
        sleepModule = new SleepModule(reactContext);
        createNotificationChannel(reactContext);
        instance = this;
        Log.v("BackgroundTimerModule","BackgroundTimerModule is on.");
    }

    @ReactMethod
    public void startTimerWithInterval(int newInterval) {
        timerInterval = newInterval;
        startTimer(); // Start the timer with the new interval
    }

    public long getRemainingTime() {
        return remainingTime;
    }

    // Expose a method to get the instance
    public static BackgroundTimerModule getInstance() {
        return instance;
    }

    @Override
    public String getName() {
        return "BackgroundTimerModule";
    }

    @ReactMethod
    public void startTimer() {
    Log.v("BackgroundTimerModule","Timer started to count.");

    if (countDownTimer != null) {
            // Remove the old timer if exists.
            countDownTimer.cancel();
        }

    Context context = getReactApplicationContext();
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

    devicePolicyManager = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
    adminComponent = new ComponentName(context, DeviceAdminReceiver.class);

    if(isDeviceAdmin()){

    }else{
        requestDeviceAdmin();
        return;
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        if (notificationManager.areNotificationsEnabled()) {
            countDownTimer = new CountDownTimer(timerInterval, 1000) {
                @Override
                public void onTick(long millisUntilFinished) {
                    // Convert milliseconds to seconds
                    long totalSeconds = millisUntilFinished / 1000;

                    // Calculate minutes and remaining seconds
                    long minutes = totalSeconds / 60;
                    long remainingSeconds = totalSeconds % 60;

                    // If there are remaining seconds, consider it as an additional minute
                    if (remainingSeconds > 0) {
                        minutes++;
                    }

                    updateNotification("😴 " + minutes + " minutes");
                    sendTimerTime(minutes);
                    remainingTime = millisUntilFinished;
                }

                @Override
                public void onFinish() {
                    updateNotification("Going to sleep...");
                    removeNotification();
                    triggerSleep();
                }
            }.start();
            sendTimerStartEvent();
        } else {
            requestNotificationAccess();
        }
    }
}

    @ReactMethod
    public void stopTimer() {
        if (countDownTimer != null) {
            Log.v("verbose","Timer ended.");
            countDownTimer.cancel();
            sendTimerStopEvent();
            removeNotification();
        }
    }


private void updateNotification(String contentText) {
    Context context = getReactApplicationContext();
    NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

    // Customize the notification as needed
    Intent notificationIntent = new Intent(context, MainActivity.class);
    notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

    // Create a PendingIntent for the "Add 5 Minutes" action
    Intent addFiveMinutesIntent = new Intent(context, AddFiveMinutesReceiver.class);
    addFiveMinutesIntent.setAction("com.sleeptimer.ADD_MINUTES");  // Add a custom action
    PendingIntent addFiveMinutesPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            addFiveMinutesIntent,
            PendingIntent.FLAG_IMMUTABLE
    );

    // Create a PendingIntent for the "Stop Timer" action
    Intent stopTimerIntent = new Intent(context, StopTimerReceiver.class);
    stopTimerIntent.setAction("com.sleeptimer.STOP_TIMER");  // Add a custom action
    PendingIntent stopTimerPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            stopTimerIntent,
            PendingIntent.FLAG_IMMUTABLE
    );

    StopTimerReceiver.setReactContext(reactContextApp);
    AddFiveMinutesReceiver.setReactContext(reactContextApp);


    Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_stat_name)
            .setContentIntent(pendingIntent)  // Add this line to set the PendingIntent
            .addAction(R.drawable.ic_stat_name, "Add 5 Minutes", addFiveMinutesPendingIntent)
            .addAction(R.drawable.ic_stat_name, "Stop Timer", stopTimerPendingIntent);


    if (notificationManager != null) {
        notificationManager.notify(NOTIFICATION_ID, builder.build());
    }
}

    @ReactMethod
    public void updateTimerInterval(int newInterval) {
        timerInterval = newInterval;
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Background Timer",
                    NotificationManager.IMPORTANCE_LOW
            );

            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
    private void removeNotification() {
        Context context = getReactApplicationContext();
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
    }

    private void triggerSleep() {
        sleepModule.startSleep();
    }

    private void requestNotificationAccess() {
        Context context = getReactApplicationContext();

        Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        // For Android 5-7
        intent.putExtra("app_package", context.getPackageName());
        intent.putExtra("app_uid", context.getApplicationInfo().uid);

        // For Android 8 and above
        intent.putExtra("android.provider.extra.APP_PACKAGE", context.getPackageName());

        context.startActivity(intent);
    }

    private boolean isDeviceAdmin() {
        return devicePolicyManager.isAdminActive(adminComponent);
    }

    private void requestDeviceAdmin() {
        Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Enable device admin to control sleep");
        getReactApplicationContext().startActivityForResult(intent, DEVICE_ADMIN_REQUEST, null);
    }

    private void sendTimerStartEvent() {
        reactContextApp
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("TimerStarted", null);
    }

    private void sendTimerStopEvent() {
        reactContextApp
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("TimerStopped", null);
    }

    private void sendTimerTime(long time) {
        double timeAsDouble = (double) time;
        reactContextApp
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("TimeLeft", timeAsDouble);
    }

}

