import { registerPlugin } from '@capacitor/core';

import type { ElkeBatteryPlugin } from './definitions';

const ElkeBattery = registerPlugin<ElkeBatteryPlugin>('ElkeBattery', {
  web: () => import('./web').then((m) => new m.ElkeBatteryWeb()),
});

export * from './definitions';
export { ElkeBattery };
