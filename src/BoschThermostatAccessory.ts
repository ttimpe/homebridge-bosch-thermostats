import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic, CharacteristicSetCallback, CharacteristicGetCallback, CharacteristicValue } from 'homebridge';
import BoschThermostatPlatform from './BoschThermostatPlatform'
import BoschThermostat from './BoschThermostat'

export default class BoschThermostatAccessory {
	public readonly Service: typeof Service = this.platform.api.hap.Service;
	public readonly Characteristic: typeof Characteristic = this.platform.api.hap.Characteristic;

	private service: Service


	private thermostat: BoschThermostat
	private enabledServices: Service[] = []

	constructor(public readonly platform: BoschThermostatPlatform, public accessory: PlatformAccessory, public readonly log: Logger, thermostat: BoschThermostat) {
	this.thermostat = thermostat

	this.log.info("Created new BoschThermostatAccessory")
	this.log.info(JSON.stringify(this.thermostat))


	this.accessory.getService(this.platform.Service.AccessoryInformation)!
			.setCharacteristic(this.platform.Characteristic.Manufacturer, 'BOSCH')
			.setCharacteristic(this.platform.Characteristic.FirmwareRevision, '1.0.0')
			.setCharacteristic(this.platform.Characteristic.Model, 'Room Thermostat')
			.setCharacteristic(this.platform.Characteristic.SerialNumber, this.thermostat.serial)

	  this.service = this.accessory.getService(this.Service.Thermostat) || this.accessory.addService(this.Service.Thermostat)
      // create handlers for required characteristics
      this.service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
        .on('get', this.handleCurrentHeatingCoolingStateGet.bind(this));

      this.service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
        .on('get', this.handleTargetHeatingCoolingStateGet.bind(this))
        .on('set', this.handleTargetHeatingCoolingStateSet.bind(this));

      this.service.getCharacteristic(this.Characteristic.CurrentTemperature)
        .on('get', this.handleCurrentTemperatureGet.bind(this));

      this.service.getCharacteristic(this.Characteristic.TargetTemperature)
        .on('get', this.handleTargetTemperatureGet.bind(this))
        .on('set', this.handleTargetTemperatureSet.bind(this));

      this.service.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
        .on('get', this.handleTemperatureDisplayUnitsGet.bind(this))
        .on('set', this.handleTemperatureDisplayUnitsSet.bind(this));

      // create handlers for required characteristics
     this.service.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
     .on('get', this.handleCurrentRelativeHumidityGet.bind(this));


  }

  /**
   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
   */
  handleCurrentHeatingCoolingStateGet(callback: CharacteristicGetCallback) {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');

    // set this to a valid value for CurrentHeatingCoolingState
    const currentValue = 1;

    callback(null, currentValue);
  }


  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  handleTargetHeatingCoolingStateGet(callback: CharacteristicGetCallback) {
    this.log.debug('Triggered GET TargetHeatingCoolingState');

    // set this to a valid value for TargetHeatingCoolingState
    const currentValue = 1;

    callback(null, currentValue);
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  handleTargetHeatingCoolingStateSet(value: any, callback: CharacteristicSetCallback) {
    this.log.debug('Triggered SET TargetHeatingCoolingState:',value);

    callback(null);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet(callback: CharacteristicGetCallback) {
    this.log.debug('Triggered GET CurrentTemperature');

    // set this to a valid value for CurrentTemperature
    const currentValue = 1;

    callback(null, this.thermostat.currentTemperature);
  }


  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  handleTargetTemperatureGet(callback: CharacteristicGetCallback) {
    this.log.debug('Triggered GET TargetTemperature');

    // set this to a valid value for TargetTemperature
    const currentValue = 1;

    callback(null, this.thermostat.targetTemperature);
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  handleTargetTemperatureSet(value: any, callback: CharacteristicSetCallback) {
    this.log.debug('Triggered SET TargetTemperature:',value);

    callback(null);

    this.platform.setTemperature(this.thermostat, value)
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsGet(callback: CharacteristicGetCallback) {
    this.log.debug('Triggered GET TemperatureDisplayUnits');

    // set this to a valid value for TemperatureDisplayUnits
    const currentValue = 0;

    callback(null, currentValue);
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsSet(value: any, callback: CharacteristicSetCallback) {
    this.log.debug('Triggered SET TemperatureDisplayUnits:',value);

    callback(null);
  }

  handleCurrentRelativeHumidityGet(callback: CharacteristicGetCallback) {
  	callback(null, this.thermostat.humidityPercentage)
  }

}