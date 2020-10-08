"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BoschThermostatPlatform_1 = __importDefault(require("./BoschThermostatPlatform"));
module.exports = (api) => {
    api.registerPlatform('homebridge-bosch', 'BoschThermostat', BoschThermostatPlatform_1.default);
};
