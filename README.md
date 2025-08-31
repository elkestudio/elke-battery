# elke-battery

Battery and charging status

## Install

```bash
npm install elke-battery
npx cap sync
```

## API

<docgen-index>

* [`getBatteryInfo()`](#getbatteryinfo)
* [`addBatteryListener(...)`](#addbatterylistener)
* [`removeBatteryListener(...)`](#removebatterylistener)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### getBatteryInfo()

```typescript
getBatteryInfo() => Promise<BatteryInfo>
```

Get current battery information

**Returns:** <code>Promise&lt;<a href="#batteryinfo">BatteryInfo</a>&gt;</code>

--------------------


### addBatteryListener(...)

```typescript
addBatteryListener(callback: (info: BatteryInfo) => void) => Promise<{ value: string; }>
```

Listen for battery changes

| Param          | Type                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| **`callback`** | <code>(info: <a href="#batteryinfo">BatteryInfo</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### removeBatteryListener(...)

```typescript
removeBatteryListener(callbackId: string) => Promise<void>
```

Remove battery listener

| Param            | Type                |
| ---------------- | ------------------- |
| **`callbackId`** | <code>string</code> |

--------------------


### Interfaces


#### BatteryInfo

| Prop               | Type                                                                              | Description                                           |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **`level`**        | <code>number</code>                                                               | Battery level as a percentage (0-100)                 |
| **`isCharging`**   | <code>boolean</code>                                                              | Whether the device is currently charging              |
| **`isLowBattery`** | <code>boolean</code>                                                              | Whether the battery level is low (typically &lt; 20%) |
| **`status`**       | <code>'charging' \| 'discharging' \| 'full' \| 'not_charging' \| 'unknown'</code> | Battery status text                                   |

</docgen-api>
