import { registerPlugin, Capacitor } from '@capacitor/core';

import type { ElkeBatteryPlugin, BatteryInfo } from './definitions';

const ElkeBatteryNative = registerPlugin<ElkeBatteryPlugin>('ElkeBattery', {
  web: () => import('./web').then((m) => new m.ElkeBatteryWeb()),
});

// Enhanced wrapper to handle native events properly
class ElkeBatteryWrapper {
  private listeners: Map<string, (info: BatteryInfo) => void> = new Map();
  private nativeListenerSetup = false;

  async getBatteryInfo(): Promise<BatteryInfo> {
    return ElkeBatteryNative.getBatteryInfo();
  }

  async addBatteryListener(callback: (info: BatteryInfo) => void): Promise<string> {
    const callbackId = this.generateCallbackId();
    this.listeners.set(callbackId, callback);

    // For native platforms, use Capacitor's event system
    if (Capacitor.isNativePlatform()) {
      if (!this.nativeListenerSetup) {
        // Listen for native events using Capacitor's event system
        (ElkeBatteryNative as any).addListener('batteryChanged', (batteryInfo: BatteryInfo) => {
          // Notify all registered listeners
          this.listeners.forEach(cb => cb(batteryInfo));
        });
        this.nativeListenerSetup = true;
      }
      
      // Also call the native method to ensure the receiver is registered
      try {
        const result = await ElkeBatteryNative.addBatteryListener(() => {});
        // The native method returns a JSObject with the callbackId, but we use our own
        console.log('Native listener registered:', result?.value || result);
      } catch (error) {
        console.warn('Native battery listener setup warning:', error);
      }
    } else {
      // For web, use the original implementation
      const result = await ElkeBatteryNative.addBatteryListener(callback);
      return result.value;
    }

    return callbackId;
  }

  async removeBatteryListener(callbackId: string): Promise<void> {
    this.listeners.delete(callbackId);

    if (!Capacitor.isNativePlatform()) {
      return ElkeBatteryNative.removeBatteryListener(callbackId);
    }

    // For native, if no more listeners, we could clean up but we'll keep it simple
    return ElkeBatteryNative.removeBatteryListener(callbackId);
  }

  private generateCallbackId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

const ElkeBattery = new ElkeBatteryWrapper();

export * from './definitions';
export { ElkeBattery };
