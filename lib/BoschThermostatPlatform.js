"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const bosch_smart_home_bridge_1 = require("bosch-smart-home-bridge");
const BoschThermostatAccessory_1 = __importDefault(require("./BoschThermostatAccessory"));
const BoschThermostat_1 = __importDefault(require("./BoschThermostat"));
const fs = require('fs');
class BoschThermostatPlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.accessories = [];
        this.thermostats = [];
        this.boschThermostats = [];
        api.on('didFinishLaunching', () => {
            this.didFinishLaunching();
        });
    }
    loadCertificate(certificatePath, privateKeyPath) {
        fs.readFile(certificatePath, 'utf-8', (err, certData) => {
            if (err) {
                this.log.error("Could not load cert from " + certificatePath);
                return;
            }
            else {
                fs.readFile(privateKeyPath, 'utf-8', (keyError, keyData) => {
                    if (keyError) {
                        this.log.error("Could not load private key from " + privateKeyPath);
                        return;
                    }
                    else {
                        this.certificate = certData;
                        this.privateKey = keyData;
                        this.establishConnection();
                    }
                });
            }
        });
    }
    didFinishLaunching() {
        this.log.info('connecting to host ' + this.config.host + ' using systemPassword ' + this.config.systemPassword);
        this.loadCertificate(this.config.certificatePath, this.config.privateKeyPath);
    }
    establishConnection() {
        this.bshb = bosch_smart_home_bridge_1.BoschSmartHomeBridgeBuilder.builder()
            .withHost(this.config.host)
            .withClientCert(this.certificate)
            .withClientPrivateKey(this.privateKey)
            .build();
        this.bshb.pairIfNeeded('bshb', "homebridge", this.config.systemPassword).pipe(operators_1.catchError(err => {
            console.log("Test Result error:");
            console.log(err);
            return rxjs_1.EMPTY;
        }), operators_1.switchMap(pairingResponse => {
            console.log("Pairing result:");
            if (pairingResponse) {
                console.log("Pairing successful");
                console.log(pairingResponse.incomingMessage.statusCode);
                console.log(pairingResponse.parsedResponse);
            }
            else {
                console.log("Already paired");
            }
            return this.bshb.getBshcClient().getDevices();
        })).subscribe(getDevicesResponse => {
            this.log.info("GetDevices:");
            this.createAccessories(getDevicesResponse.parsedResponse);
        });
    }
    createAccessories(devicesResponse) {
        for (var i = 0; i < devicesResponse.length; i++) {
            if (devicesResponse[i].manufacturer == 'BOSCH' && devicesResponse[i].deviceModel == 'ROOM_CLIMATE_CONTROL') {
                let boschThermostat = new BoschThermostat_1.default();
                boschThermostat.id = devicesResponse[i].id;
                boschThermostat.childDeviceIds = devicesResponse[i].childDeviceIds;
                var hmDevice = devicesResponse.find((hmDevice) => hmDevice.id === boschThermostat.childDeviceIds[0]);
                boschThermostat.name = hmDevice.name;
                this.boschThermostats.push(boschThermostat);
                const uuid = this.api.hap.uuid.generate(boschThermostat.id);
                let accessory = this.accessories.find(accessory => accessory.UUID === uuid);
                if (accessory) {
                    this.log.info('Restoring cached accessory', accessory.displayName);
                    accessory.context.deviceId = boschThermostat.id;
                    accessory.context.name = boschThermostat.name;
                    this.api.updatePlatformAccessories([accessory]);
                }
                else {
                    this.log.info('Adding new device:', boschThermostat.name);
                    accessory = new this.api.platformAccessory(boschThermostat.name, uuid);
                    accessory.context.deviceId = boschThermostat.id;
                    accessory.context.name = boschThermostat.name;
                    this.api.registerPlatformAccessories('homebridge-bosch', 'BoschThermostat', [accessory]);
                }
                let boschThermostatAccessory = new BoschThermostatAccessory_1.default(this, accessory, this.log, boschThermostat);
                this.thermostats.push(boschThermostatAccessory);
            }
        }
    }
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }
}
exports.default = BoschThermostatPlatform;
