import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import BoschThermostatPlatform from './BoschThermostatPlatform'

export default class BoschThermostatAccessory {
	public readonly Service: typeof Service = this.platform.api.hap.Service;
	public readonly Characteristic: typeof Characteristic = this.platform.api.hap.Characteristic;

	constructor(public readonly platform: BoschThermostatPlatform, public accessory: PlatformAccessory) {

	}

}