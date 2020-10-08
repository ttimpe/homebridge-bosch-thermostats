export default class BoschThermostat {
	public id: string
	public name: string
	public serial: string
	public childDeviceIds: string[]
	public humidityPercentage: number = 50
	public currentTemperature: number = 0
	public targetTemperature: number = 0
}