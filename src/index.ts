import { API } from 'homebridge'
import BoschThermostatPlatform from './BoschThermostatPlatform'

export = (api: API) => {
  api.registerPlatform('homebridge-bosch', 'BoschThermostat', BoschThermostatPlatform);
}

