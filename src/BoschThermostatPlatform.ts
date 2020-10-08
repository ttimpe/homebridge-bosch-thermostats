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

	private timer: any

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
			this.createAccessories(getDevicesResponse.parsedResponse)
			this.timer = setInterval(() => this.updateValues(), 10000)
			this.updateValues()
		});
	}


	createAccessories(devicesResponse: any) {
		for (var i=0; i<devicesResponse.length; i++) {
			if (devicesResponse[i].manufacturer == 'BOSCH' && devicesResponse[i].deviceModel == 'ROOM_CLIMATE_CONTROL') {
				let boschThermostat: BoschThermostat = new BoschThermostat()
				boschThermostat.id = devicesResponse[i].id
				boschThermostat.childDeviceIds = devicesResponse[i].childDeviceIds

				var hmDevice: any = devicesResponse.find((hmDevice: any) => hmDevice.id === boschThermostat.childDeviceIds[0])
				boschThermostat.name = devicesResponse[i].serial + ' ' + hmDevice.name
				boschThermostat.serial = devicesResponse[i].serial
				this.boschThermostats.push(boschThermostat)

				const uuid = this.api.hap.uuid.generate('homebridge-bosch-' + boschThermostat.id)
				let accessory = this.accessories.find(accessory => accessory.UUID === uuid)

				if (accessory) {
					this.log.info('Restoring cached accessory', accessory.displayName)
					accessory.context.deviceId = boschThermostat.id
					this.api.updatePlatformAccessories([accessory])
				} else {
					this.log.info('Adding new device:', boschThermostat.name)
					accessory = new this.api.platformAccessory(boschThermostat.name, uuid)
					accessory.context.deviceId = boschThermostat.id
					
					this.api.registerPlatformAccessories('homebridge-bosch', 'BoschThermostat', [accessory])
				}
				let boschThermostatAccessory = new BoschThermostatAccessory(this, accessory, this.log, boschThermostat)
				this.thermostats.push(boschThermostatAccessory)
 
			}
		}
	
		
	}

	updateValues() {
		this.bshb.getBshcClient().getDevicesServices().subscribe(getServicesResponse => {
			this.log.debug('got services')
			this.log.debug(getServicesResponse.parsedResponse.toString())
			
			for (var i=0; i<this.boschThermostats.length; i++) {
				let propertiesForDevice = getServicesResponse.parsedResponse.filter((propertiesForDevice:any) => (propertiesForDevice.deviceId === this.boschThermostats[i].id) || (propertiesForDevice.deviceId === this.boschThermostats[i].childDeviceIds[0]))
				for (let j=0; j<propertiesForDevice.length; j++) {
					this.log.debug("Got property " + propertiesForDevice[j].id + ' for device ' + this.boschThermostats[i].id)
					switch (propertiesForDevice[j].id) {
						case 'TemperatureLevel':
				
							this.boschThermostats[i].currentTemperature = propertiesForDevice[j].state.temperature
						break;
						case 'RoomClimateControl':

							this.boschThermostats[i].targetTemperature = propertiesForDevice[j].state.setpointTemperature

						break;
						case 'HumidityLevel':
							this.log.debug('setting humdity to', propertiesForDevice[j].state.humidity)
							this.boschThermostats[i].humidityPercentage = propertiesForDevice[j].state.humidity

						break;
						default:

						break;
					}
				}
			}

			for (var i=0; i<this.thermostats.length; i++) {
				this.thermostats[i].service.updateCharacteristic(this.Characteristic.CurrentTemperature, this.thermostats[i].thermostat.currentTemperature)
				this.thermostats[i].service.updateCharacteristic(this.Characteristic.TargetTemperature, this.thermostats[i].thermostat.targetTemperature)
				this.thermostats[i].service.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, this.thermostats[i].thermostat.humidityPercentage)

			}

		})	
	}

	setTemperature(device: BoschThermostat, temperature: number) {
		const path = '/devices/' + device.id + '/services/RoomClimateControl'

		const value = {
         "@type":"climateControlState",
         "setpointTemperature": temperature
		}



		this.bshb.getBshcClient().putState(path, value).subscribe(setResponse => {
			this.log.info('Set temperature of ' + device.name + ' to '+ temperature)
			device.targetTemperature = temperature
		})
	}

	configureAccessory(accessory: PlatformAccessory) {
		this.accessories.push(accessory)
	}
	getBoschAccessoryWithId(deviceId: string) {
		return this.thermostats.find((thermostat: BoschThermostatAccessory) => thermostat.thermostat.id === deviceId).accessory
	}






}