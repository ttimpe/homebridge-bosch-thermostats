"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const bosch_smart_home_bridge_1 = require("bosch-smart-home-bridge");
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
    didFinishLaunching() {
        this.log.info('connecting to host ' + this.config.host + ' using systemPassword ' + this.config.systemPassword);
        const certificate = bosch_smart_home_bridge_1.BshbUtils.generateClientCertificate();
        this.bshb = bosch_smart_home_bridge_1.BoschSmartHomeBridgeBuilder.builder()
            .withHost(this.config.host)
            .withClientCert(certificate.cert)
            .withClientPrivateKey(certificate.private)
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
