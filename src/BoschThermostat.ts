export default class BoschThermostat {
	public id: string
	public name: string
	public serial: string
	public childDeviceIds: string[]
	public humidityPercentage: number
	public currentTemperature: number
	public desiredTemperature: number
}