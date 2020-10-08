import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import {catchError, delay, switchMap} from "rxjs/operators";
import {BehaviorSubject, EMPTY, Observable} from "rxjs";

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
		this.log.info('connecting to host ' + this.config.host + ' using systemPassword ' + this.config.systemPassword)
		const certificate = BshbUtils.generateClientCertificate();
		this.bshb = BoschSmartHomeBridgeBuilder.builder()
		.withHost(this.config.host)
		.withClientCert(certificate.cert)
		.withClientPrivateKey(certificate.private)
		.build();



		this.bshb.pairIfNeeded('bshb', "homebridge", this.config.systemPassword).pipe(catchError(err => {
			console.log("Test Result error:");
			console.log(err);
			return EMPTY;
		}), switchMap(pairingResponse => {
			console.log("Pairing result:");
			if (pairingResponse) {
				console.log("Pairing successful");
				console.log(pairingResponse.incomingMessage.statusCode);
				console.log(pairingResponse.parsedResponse);
			} else {
				console.log("Already paired");
			}

			return this.bshb.getBshcClient().getDevices();
		})).subscribe(getDevicesResponse => {
			this.log.info("GetDevices:");
			this.log.info(getDevicesResponse.parsedResponse.toString());

		});


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