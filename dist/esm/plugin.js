import { registerPlugin, Capacitor } from '@capacitor/core';
const ElkeBatteryNative = registerPlugin('ElkeBattery', {
    web: () => import('./web').then((m) => new m.ElkeBatteryWeb()),
});
// Simplified wrapper to handle native events properly
export class ElkeBatteryWrapper {
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
        if (Capacitor.isNativePlatform()) {
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
        if (!Capacitor.isNativePlatform()) {
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
//# sourceMappingURL=plugin.js.map