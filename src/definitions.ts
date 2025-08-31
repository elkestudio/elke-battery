export interface ElkeBatteryPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
