"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const certificate = bosch_smart_home_bridge_1.BshbUtils.generateClientCertificate();
        this.bshb = bosch_smart_home_bridge_1.BoschSmartHomeBridgeBuilder.builder()
            .withHost('192.168.0.10')
            .withClientCert(certificate.cert)
            .withClientPrivateKey(certificate.private)
            .build();
        this.bshb.pairIfNeeded('homebridge', 'homebridge', this.config.systemPassword);
        this.createAccessories();
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
