export interface ElkeBatteryPlugin {
  /**
   * Get current battery information
   */
  getBatteryInfo(): Promise<BatteryInfo>;
  
  /**
   * Listen for battery changes
   */
  addBatteryListener(callback: (info: BatteryInfo) => void): Promise<{value: string}>;
  
  /**
   * Remove battery listener
   */
  removeBatteryListener(callbackId: string): Promise<void>;
}

export interface BatteryInfo {
  /**
   * Battery level as a percentage (0-100)
   */
  level: number;
  
  /**
   * Whether the device is currently charging
   */
  isCharging: boolean;
  
  /**
   * Whether the battery level is low (typically < 20%)
   */
  isLowBattery: boolean;
  
  /**
   * Battery status text
   */
  status: 'charging' | 'discharging' | 'full' | 'not_charging' | 'unknown';
}
