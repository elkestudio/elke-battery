package com.mycompany.plugins.example;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ElkeBattery")
public class ElkeBatteryPlugin extends Plugin {

    private BroadcastReceiver batteryReceiver;
    private boolean isListening = false;

    @PluginMethod
    public void getBatteryInfo(PluginCall call) {
        JSObject ret = getBatteryStatus();
        call.resolve(ret);
    }

    @PluginMethod
    public void addBatteryListener(PluginCall call) {
        if (!isListening) {
            startBatteryListener();
        }
        
        // Return a callback ID in a JSObject
        String callbackId = "battery_listener_" + System.currentTimeMillis();
        JSObject ret = new JSObject();
        ret.put("value", callbackId);
        call.resolve(ret);
    }

    @PluginMethod
    public void removeBatteryListener(PluginCall call) {
        stopBatteryListener();
        call.resolve();
    }

    private JSObject getBatteryStatus() {
        Context context = getContext();
        IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        Intent batteryStatus = context.registerReceiver(null, ifilter);

        int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        float batteryPct = (level * 100) / (float) scale;

        int status = batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
        boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                           status == BatteryManager.BATTERY_STATUS_FULL;

        boolean isLowBattery = batteryPct < 20;

        String statusText = "unknown";
        switch (status) {
            case BatteryManager.BATTERY_STATUS_CHARGING:
                statusText = batteryPct >= 100 ? "full" : "charging";
                break;
            case BatteryManager.BATTERY_STATUS_DISCHARGING:
                statusText = "discharging";
                break;
            case BatteryManager.BATTERY_STATUS_FULL:
                statusText = "full";
                break;
            case BatteryManager.BATTERY_STATUS_NOT_CHARGING:
                statusText = "not_charging";
                break;
            default:
                statusText = "unknown";
                break;
        }

        JSObject ret = new JSObject();
        ret.put("level", Math.round(batteryPct));
        ret.put("isCharging", isCharging);
        ret.put("isLowBattery", isLowBattery);
        ret.put("status", statusText);

        return ret;
    }

    private void startBatteryListener() {
        if (batteryReceiver == null) {
            batteryReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    String action = intent.getAction();
                    android.util.Log.d("ElkeBattery", "Battery event received: " + action);
                    
                    JSObject batteryInfo = getBatteryStatus();
                    android.util.Log.d("ElkeBattery", "Sending battery update: " + batteryInfo.toString());
                    
                    // Use the correct event name that matches the TypeScript wrapper
                    notifyListeners("batteryChanged", batteryInfo);
                }
            };
        }

        // Only register if not already listening
        if (!isListening) {
            IntentFilter filter = new IntentFilter();
            // Core battery events
            filter.addAction(Intent.ACTION_BATTERY_CHANGED);
            filter.addAction(Intent.ACTION_POWER_CONNECTED);
            filter.addAction(Intent.ACTION_POWER_DISCONNECTED);
            // Additional events for better live updates
            filter.addAction(Intent.ACTION_BATTERY_LOW);
            filter.addAction(Intent.ACTION_BATTERY_OKAY);
            filter.addAction("android.intent.action.BATTERY_CHANGED");

            try {
                getContext().registerReceiver(batteryReceiver, filter);
                isListening = true;
                android.util.Log.d("ElkeBattery", "Battery receiver registered successfully with enhanced filters");
                
                // Send initial battery status immediately
                JSObject initialStatus = getBatteryStatus();
                notifyListeners("batteryChanged", initialStatus);
                android.util.Log.d("ElkeBattery", "Initial battery status sent: " + initialStatus.toString());
                
            } catch (Exception e) {
                // Handle any registration errors
                android.util.Log.e("ElkeBattery", "Error registering battery receiver", e);
                e.printStackTrace();
            }
        }
    }

    private void stopBatteryListener() {
        if (batteryReceiver != null && isListening) {
            try {
                getContext().unregisterReceiver(batteryReceiver);
                isListening = false;
                android.util.Log.d("ElkeBattery", "Battery receiver unregistered successfully");
            } catch (Exception e) {
                android.util.Log.e("ElkeBattery", "Error unregistering battery receiver", e);
                e.printStackTrace();
            }
        }
    }

    @Override
    protected void handleOnDestroy() {
        stopBatteryListener();
        super.handleOnDestroy();
    }
}
