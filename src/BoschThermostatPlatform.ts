import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import {catchError, delay, switchMap} from "rxjs/operators";
import {BehaviorSubject, EMPTY, Observable} from "rxjs";

import {BoschSmartHomeBridge, BoschSmartHomeBridgeBuilder, BshbUtils } from 'bosch-smart-home-bridge';

import BoschThermostatAccessory from './BoschThermostatAccessory'
import BoschThermostat from './BoschThermostat'

const fs = require('fs')

export default class BoschThermostatPlatform implements DynamicPlatformPlugin {
	public readonly Service: typeof Service = this.api.hap.Service;
	public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

	public bshb: BoschSmartHomeBridge


	public accessories: PlatformAccessory[] = []
	public thermostats: BoschThermostatAccessory[] = []
	public boschThermostats: BoschThermostat[] = []

	private certificate: string
	private privateKey: string

	constructor(public readonly log: Logger, public readonly config: PlatformConfig, public readonly api: API) {
		api.on('didFinishLaunching', () => {
			this.didFinishLaunching();
		})
	}

	loadCertificate (certificatePath: string, privateKeyPath: string) {
		fs.readFile(certificatePath, 'utf-8', (err: any, certData: string) => {
			if (err) {
				this.log.error("Could not load cert from " + certificatePath)
				return
			} else {
				
				fs.readFile(privateKeyPath, 'utf-8', (keyError: any, keyData: string) => {
					if (keyError) {
						this.log.error("Could not load private key from " + privateKeyPath)
						return
					} else {
						this.certificate = certData;
						this.privateKey = keyData;
						this.establishConnection()
					}
				})
			}
		})
	}


	didFinishLaunching() {
		this.log.info('connecting to host ' + this.config.host + ' using systemPassword ' + this.config.systemPassword)
		this.loadCertificate(this.config.certificatePath, this.config.privateKeyPath)


		


	}

	establishConnection() {


		this.bshb = BoschSmartHomeBridgeBuilder.builder()
		.withHost(this.config.host)
		.withClientCert(this.certificate)
		.withClientPrivateKey(this.privateKey)
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
			this.createAccessories(getDevicesResponse.parsedResponse)

		});
	}


	createAccessories(devicesResponse: any) {
		for (var i=0; i<devicesResponse.length; i++) {
			if (devicesResponse[i].manufacturer == 'BOSCH' && devicesResponse[i].deviceModel == 'ROOM_CLIMATE_CONTROL') {
				let boschThermostat: BoschThermostat = new BoschThermostat()
				boschThermostat.id = devicesResponse[i].id
				boschThermostat.name = devicesResponse[i].name
				boschThermostat.childDeviceIds = devicesResponse[i].childDeviceIds
				this.boschThermostats.push(boschThermostat)

				const uuid = this.api.hap.uuid.generate(boschThermostat.id)
				let accessory = this.accessories.find(accessory => accessory.UUID === uuid)

				if (accessory) {
					this.log.info('Restoring cached accessory', accessory.displayName)
					accessory.context.deviceId = boschThermostat.id
					accessory.context.name = boschThermostat.name
					this.api.updatePlatformAccessories([accessory])
				} else {
					this.log.info('Adding new device:', boschThermostat.name)
					accessory = new this.api.platformAccessory(boschThermostat.name, uuid)
					accessory.context.deviceId = boschThermostat.id
					accessory.context.name = boschThermostat.name
					this.api.registerPlatformAccessories('homebridge-bosch', 'BoschThermostat', [accessory])
				}
				let boschThermostatAccessory = new BoschThermostatAccessory(this, accessory, this.log, boschThermostat)
				this.thermostats.push(boschThermostatAccessory)
 
			}
		}
		
	}
	configureAccessory(accessory: PlatformAccessory) {
		this.accessories.push(accessory)
	}



}