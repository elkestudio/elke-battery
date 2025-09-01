'use strict';

var core = require('@capacitor/core');

const ElkeBatteryNative = core.registerPlugin('ElkeBattery', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.ElkeBatteryWeb()),
});
// Simplified wrapper to handle native events properly
class ElkeBatteryWrapper {
    constructor() {
        this.listeners = new Map();
        this.nativeListenerHandle = null;
    }
    async getBatteryInfo() {
        return ElkeBatteryNative.getBatteryInfo();
    }
    async addBatteryListener(callback) {
        const callbackId = this.generateCallbackId();
        this.listeners.set(callbackId, callback);
        // For native platforms, use Capacitor's event system
        if (core.Capacitor.isNativePlatform()) {
            if (!this.nativeListenerHandle) {
                // Listen for native events using Capacitor's event system
                this.nativeListenerHandle = await ElkeBatteryNative.addListener('batteryChanged', (data) => {
                    console.log('Native battery event received:', data);
                    // Notify all registered listeners
                    this.listeners.forEach(cb => cb(data));
                });
                console.log('Capacitor event listener setup complete');
            }
            // Call the native method to start the battery receiver
            try {
                await ElkeBatteryNative.addBatteryListener(() => { });
                console.log('Native battery receiver started');
            }
            catch (error) {
                console.error('Native battery listener setup error:', error);
            }
        }
        else {
            // For web, use the original implementation
            const result = await ElkeBatteryNative.addBatteryListener(callback);
            return result.value;
        }
        return callbackId;
    }
    async removeBatteryListener(callbackId) {
        this.listeners.delete(callbackId);
        if (!core.Capacitor.isNativePlatform()) {
            return ElkeBatteryNative.removeBatteryListener(callbackId);
        }
        // For native, if no more listeners, clean up the native listener
        if (this.listeners.size === 0) {
            try {
                await ElkeBatteryNative.removeBatteryListener(callbackId);
                if (this.nativeListenerHandle) {
                    await this.nativeListenerHandle.remove();
                    this.nativeListenerHandle = null;
                }
                console.log('Native listener cleaned up');
            }
            catch (error) {
                console.error('Error cleaning up native listener:', error);
            }
        }
    }
    generateCallbackId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

const ElkeBattery = new ElkeBatteryWrapper();

class ElkeBatteryWeb extends core.WebPlugin {
    constructor() {
        super();
        this.batteryListeners = new Map();
        this.eventListeners = new Map();
    }
    async getBatteryInfo() {
        var _a, _b;
        if (!this.batteryAPI) {
            // @ts-ignore
            this.batteryAPI = await ((_b = (_a = navigator).getBattery) === null || _b === void 0 ? void 0 : _b.call(_a));
        }
        if (this.batteryAPI) {
            const level = Math.round(this.batteryAPI.level * 100);
            const isCharging = this.batteryAPI.charging;
            const isLowBattery = level < 20;
            let status = 'unknown';
            if (isCharging) {
                status = level === 100 ? 'full' : 'charging';
            }
            else {
                status = 'discharging';
            }
            return {
                level,
                isCharging,
                isLowBattery,
                status
            };
        }
        // Fallback for browsers that don't support Battery API
        return {
            level: 100,
            isCharging: false,
            isLowBattery: false,
            status: 'unknown'
        };
    }
    async addBatteryListener(callback) {
        var _a, _b;
        const callbackId = this.generateCallbackId();
        this.batteryListeners.set(callbackId, callback);
        if (!this.batteryAPI) {
            // @ts-ignore
            this.batteryAPI = await ((_b = (_a = navigator).getBattery) === null || _b === void 0 ? void 0 : _b.call(_a));
        }
        if (this.batteryAPI) {
            const updateCallback = () => {
                this.getBatteryInfo().then(info => callback(info));
            };
            // Store the actual event listener functions for proper cleanup
            this.eventListeners.set(callbackId + '_charging', updateCallback);
            this.eventListeners.set(callbackId + '_level', updateCallback);
            this.batteryAPI.addEventListener('chargingchange', updateCallback);
            this.batteryAPI.addEventListener('levelchange', updateCallback);
        }
        return { value: callbackId };
    }
    async removeBatteryListener(callbackId) {
        this.batteryListeners.delete(callbackId);
        // Remove the actual event listeners from the battery API
        if (this.batteryAPI) {
            const chargingListener = this.eventListeners.get(callbackId + '_charging');
            const levelListener = this.eventListeners.get(callbackId + '_level');
            if (chargingListener) {
                this.batteryAPI.removeEventListener('chargingchange', chargingListener);
                this.eventListeners.delete(callbackId + '_charging');
            }
            if (levelListener) {
                this.batteryAPI.removeEventListener('levelchange', levelListener);
                this.eventListeners.delete(callbackId + '_level');
            }
        }
    }
    generateCallbackId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ElkeBatteryWeb: ElkeBatteryWeb
});

exports.ElkeBattery = ElkeBattery;
//# sourceMappingURL=plugin.cjs.js.map
