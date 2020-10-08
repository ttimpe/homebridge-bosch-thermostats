"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const bosch_smart_home_bridge_1 = require("bosch-smart-home-bridge");
const fs = require('fs');
class BoschThermostatPlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
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
        this.log.info('cert is', this.certificate);
        this.log.info('key is', this.privateKey);
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
            this.log.info(getDevicesResponse.parsedResponse.toString());
        });
    }
    createAccessories() {
        this.log.info('Starting getDevices');
        this.bshb.getBshcClient().getDevices().subscribe(response => {
            this.log.info("Got response");
            this.log.info(response.toString());
        });
    }
    configureAccessory(accessory) {
        this.accessories.push(accessory);
    }
}
exports.default = BoschThermostatPlatform;
