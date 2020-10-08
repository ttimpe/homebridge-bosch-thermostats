import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import {BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder, BshbUtils } from 'bosch-smart-home-bridge';

import BoschThermostatAccessory from './BoschThermostatAccessory'

export default class BoschThermostatPlatform implements DynamicPlatformPlugin {
	public readonly Service: typeof Service = this.api.hap.Service;
	public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

	public bshb: BoschSmartHomeBridge


	public accessories: PlatformAccessory[]
	public thermostats: BoschThermostatAccessory[]

	constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
		api.on('didFinishLaunching', () => {
			this.didFinishLaunching();
		})
	}

	didFinishLaunching() {
		const certificate = BshbUtils.generateClientCertificate();
		this.bshb = BoschSmartHomeBridgeBuilder.builder()
    		.withHost('192.168.0.10')
    		.withClientCert(certificate.cert)
    		.withClientPrivateKey(certificate.private)
    		.build();

    	this.bshb.pairIfNeeded('homebridge', 'homebridge', this.config.systemPassword)

    	this.createAccessories()

	}


	createAccessories() {
		this.log.info('Starting getDevices')
		this.bshb.getBshcClient().getDevices().subscribe(response => {
			this.log.info("Got response")
			this.log.info(response.toString())
		})
	}
	configureAccessory(accessory: PlatformAccessory) {
		this.accessories.push(accessory)
	}



}