import { WebPlugin } from '@capacitor/core';
import type { ElkeBatteryPlugin, BatteryInfo } from './definitions';
export declare class ElkeBatteryWeb extends WebPlugin implements ElkeBatteryPlugin {
    private batteryAPI;
    private batteryListeners;
    private eventListeners;
    constructor();
    getBatteryInfo(): Promise<BatteryInfo>;
    addBatteryListener(callback: (info: BatteryInfo) => void): Promise<{
        value: string;
    }>;
    removeBatteryListener(callbackId: string): Promise<void>;
    private generateCallbackId;
}
