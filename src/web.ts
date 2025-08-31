import { WebPlugin } from '@capacitor/core';

import type { ElkeBatteryPlugin } from './definitions';

export class ElkeBatteryWeb extends WebPlugin implements ElkeBatteryPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
