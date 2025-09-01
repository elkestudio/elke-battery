import type { BatteryInfo } from './definitions';
export declare class ElkeBatteryWrapper {
    private listeners;
    private nativeListenerHandle;
    getBatteryInfo(): Promise<BatteryInfo>;
    addBatteryListener(callback: (info: BatteryInfo) => void): Promise<string>;
    removeBatteryListener(callbackId: string): Promise<void>;
    private generateCallbackId;
}
