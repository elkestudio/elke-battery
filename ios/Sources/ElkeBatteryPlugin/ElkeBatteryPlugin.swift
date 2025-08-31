import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(ElkeBatteryPlugin)
public class ElkeBatteryPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ElkeBatteryPlugin"
    public let jsName = "ElkeBattery"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getBatteryInfo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addBatteryListener", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeBatteryListener", returnType: CAPPluginReturnPromise)
    ]
    private var isListening = false
    
    @objc func getBatteryInfo(_ call: CAPPluginCall) {
        UIDevice.current.isBatteryMonitoringEnabled = true
        
        let level = UIDevice.current.batteryLevel
        let state = UIDevice.current.batteryState
        
        let batteryLevel = Int(level * 100)
        let isCharging = state == .charging || state == .full
        let isLowBattery = batteryLevel < 20
        
        var status = "unknown"
        switch state {
        case .charging:
            status = batteryLevel >= 100 ? "full" : "charging"
        case .unplugged:
            status = "discharging"
        case .full:
            status = "full"
        default:
            status = "unknown"
        }
        
        call.resolve([
            "level": batteryLevel,
            "isCharging": isCharging,
            "isLowBattery": isLowBattery,
            "status": status
        ])
    }
    
    @objc func addBatteryListener(_ call: CAPPluginCall) {
        if !isListening {
            startBatteryListener()
        }
        
        let callbackId = "battery_listener_\(Date().timeIntervalSince1970)"
        call.resolve([
            "callbackId": callbackId
        ])
    }
    
    @objc func removeBatteryListener(_ call: CAPPluginCall) {
        stopBatteryListener()
        call.resolve()
    }
    
    private func startBatteryListener() {
        UIDevice.current.isBatteryMonitoringEnabled = true
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(batteryLevelDidChange),
            name: UIDevice.batteryLevelDidChangeNotification,
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(batteryStateDidChange),
            name: UIDevice.batteryStateDidChangeNotification,
            object: nil
        )
        
        isListening = true
    }
    
    private func stopBatteryListener() {
        NotificationCenter.default.removeObserver(self, name: UIDevice.batteryLevelDidChangeNotification, object: nil)
        NotificationCenter.default.removeObserver(self, name: UIDevice.batteryStateDidChangeNotification, object: nil)
        isListening = false
    }
    
    @objc private func batteryLevelDidChange() {
        sendBatteryUpdate()
    }
    
    @objc private func batteryStateDidChange() {
        sendBatteryUpdate()
    }
    
    private func sendBatteryUpdate() {
        let level = UIDevice.current.batteryLevel
        let state = UIDevice.current.batteryState
        
        let batteryLevel = Int(level * 100)
        let isCharging = state == .charging || state == .full
        let isLowBattery = batteryLevel < 20
        
        var status = "unknown"
        switch state {
        case .charging:
            status = batteryLevel >= 100 ? "full" : "charging"
        case .unplugged:
            status = "discharging"
        case .full:
            status = "full"
        default:
            status = "unknown"
        }
        
        notifyListeners("batteryChanged", data: [
            "level": batteryLevel,
            "isCharging": isCharging,
            "isLowBattery": isLowBattery,
            "status": status
        ])
    }
    
    deinit {
        stopBatteryListener()
    }
}
