# homebridge-bosch-thermostats

As Bosch has introduced HomeKit support for room thermostats, this Homebridge plugin is no longer necessary.

This is a simple plugin that exposes Bosch room thermostats to HomeKit. I built it since they are, as of October 2020, not yet officially supporteed.

I hope this doesn't need to exist very long.

## Installation

- Create a certificate
- Add its paths to the config section as "certificatePath" and "privateKeyPath"
- Add the systemPassword to the config section
- Press the pairing button on the Smart Home Controller
- Start homebridge

## Future development

I have no plans to actively support this plugin and I hope that I won't have to. Please file issues only if you encounter a bug.
I have no plans to support other devices as I built this just for personal use.
