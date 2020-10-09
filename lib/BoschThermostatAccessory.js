"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BoschThermostatAccessory {
    constructor(platform, accessory, log, thermostat) {
        this.platform = platform;
        this.accessory = accessory;
        this.log = log;
        this.thermostat = thermostat;
        this.Service = this.platform.api.hap.Service;
        this.Characteristic = this.platform.api.hap.Characteristic;
        this.enabledServices = [];
        this.log.info("Created new BoschThermostatAccessory");
        this.log.info(JSON.stringify(this.thermostat));
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'BOSCH')
            .setCharacteristic(this.platform.Characteristic.FirmwareRevision, '1.0.0')
            .setCharacteristic(this.platform.Characteristic.Model, 'Room Thermostat')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.thermostat.serial);
        this.service = this.accessory.getService(this.Service.Thermostat) || this.accessory.addService(this.Service.Thermostat);
        // create handlers for required characteristics
        this.service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
            .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this));
        this.service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
            .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
            .on('set', this.handleTargetHeatingCoolingStateSet.bind(this))
            .setProps({
            validValues: [
                this.platform.Characteristic.TargetHeatingCoolingState.AUTO
            ]
        });
        this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', this.handleCurrentTemperatureGet.bind(this))
            .setProps({
            minStep: 0.1,
        });
        this.service.getCharacteristic(this.Characteristic.TargetTemperature)
            .on('get', this.handleTargetTemperatureGet.bind(this))
            .on('set', this.handleTargetTemperatureSet.bind(this))
            .setProps({
            minStep: 0.1,
            minValue: 5,
            maxValue: 30
        });
        this.service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
            .on('get', this.handleTemperatureDisplayUnitsGet.bind(this))
            .on('set', this.handleTemperatureDisplayUnitsSet.bind(this))
            .setProps({
            validValues: [
                this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS
            ]
        });
        // create handlers for required characteristics
        this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
            .on('get', this.handleCurrentRelativeHumidityGet.bind(this));
    }
    /**
     * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
     */
    handleCurrentHeatingCoolingStateGet(callback) {
        this.log.debug('Triggered GET CurrentHeatingCoolingState');
        // set this to a valid value for CurrentHeatingCoolingState
        callback(null, this.platform.Characteristic.TargetHeatingCoolingState.AUTO);
    }
    /**
     * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
     */
    handleTargetHeatingCoolingStateGet(callback) {
        this.log.debug('Triggered GET TargetHeatingCoolingState');
        // set this to a valid value for TargetHeatingCoolingState
        callback(null, this.platform.Characteristic.TargetHeatingCoolingState.AUTO);
    }
    /**
     * Handle requests to set the "Target Heating Cooling State" characteristic
     */
    handleTargetHeatingCoolingStateSet(value, callback) {
        this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
        callback(null);
    }
    /**
     * Handle requests to get the current value of the "Current Temperature" characteristic
     */
    handleCurrentTemperatureGet(callback) {
        this.log.debug('Triggered GET CurrentTemperature');
        // set this to a valid value for CurrentTemperature
        const currentValue = 1;
        callback(null, this.thermostat.currentTemperature);
    }
    /**
     * Handle requests to get the current value of the "Target Temperature" characteristic
     */
    handleTargetTemperatureGet(callback) {
        this.log.debug('Triggered GET TargetTemperature');
        // set this to a valid value for TargetTemperature
        const currentValue = 1;
        callback(null, this.thermostat.targetTemperature);
    }
    /**
     * Handle requests to set the "Target Temperature" characteristic
     */
    handleTargetTemperatureSet(value, callback) {
        this.log.debug('Triggered SET TargetTemperature:', value);
        callback(null);
        this.platform.setTemperature(this.thermostat, value);
    }
    /**
     * Handle requests to get the current value of the "Temperature Display Units" characteristic
     */
    handleTemperatureDisplayUnitsGet(callback) {
        this.log.debug('Triggered GET TemperatureDisplayUnits');
        // set this to a valid value for TemperatureDisplayUnits
        const currentValue = 0;
        callback(null, currentValue);
    }
    /**
     * Handle requests to set the "Temperature Display Units" characteristic
     */
    handleTemperatureDisplayUnitsSet(value, callback) {
        this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
        callback(null);
    }
    handleCurrentRelativeHumidityGet(callback) {
        callback(null, this.thermostat.humidityPercentage);
    }
}
exports.default = BoschThermostatAccessory;
