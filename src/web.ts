import { WebPlugin } from '@capacitor/core';

import type { ElkeBatteryPlugin, BatteryInfo } from './definitions';

export class ElkeBatteryWeb extends WebPlugin implements ElkeBatteryPlugin {
  private batteryAPI: any;
  private batteryListeners: Map<string, (info: BatteryInfo) => void> = new Map();
  private eventListeners: Map<string, () => void> = new Map();

  constructor() {
    super();
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    if (!this.batteryAPI) {
      // @ts-ignore
      this.batteryAPI = await (navigator as any).getBattery?.();
    }

    if (this.batteryAPI) {
      const level = Math.round(this.batteryAPI.level * 100);
      const isCharging = this.batteryAPI.charging;
      const isLowBattery = level < 20;
      
      let status: 'charging' | 'discharging' | 'full' | 'not_charging' | 'unknown' = 'unknown';
      if (isCharging) {
        status = level === 100 ? 'full' : 'charging';
      } else {
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

  async addBatteryListener(callback: (info: BatteryInfo) => void): Promise<{value: string}> {
    const callbackId = this.generateCallbackId();
    this.batteryListeners.set(callbackId, callback);

    if (!this.batteryAPI) {
      // @ts-ignore
      this.batteryAPI = await (navigator as any).getBattery?.();
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

  async removeBatteryListener(callbackId: string): Promise<void> {
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

  private generateCallbackId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
