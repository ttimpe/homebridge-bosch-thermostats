"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BoschThermostatAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.Service = this.platform.api.hap.Service;
        this.Characteristic = this.platform.api.hap.Characteristic;
    }
}
exports.default = BoschThermostatAccessory;
