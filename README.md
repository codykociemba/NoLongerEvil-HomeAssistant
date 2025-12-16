# NoLongerEvil Home Assistant Add-on

[![Build Status](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/actions/workflows/build.yaml/badge.svg)](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/actions/workflows/build.yaml)
[![License](https://img.shields.io/github/license/codykociemba/NoLongerEvil-HomeAssistant)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/codykociemba/NoLongerEvil-HomeAssistant)](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/releases)
[![Home Assistant Add-on](https://img.shields.io/badge/Home%20Assistant-Add--on-blue.svg)](https://www.home-assistant.io/addons/)

A Home Assistant Add-on that provides self-hosted Nest thermostat control via the NoLongerEvil API. Control your Nest thermostats locally without relying on external cloud services.

## Installation

### Quick Install

1. Click the button below to add this repository to your Home Assistant instance:

   [![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fcodykociemba%2FNoLongerEvil-HomeAssistant)

2. Find **NoLongerEvil HomeAssistant** in the Add-on store and click **Install**

3. Configure the Add-on (see [Configuration](#configuration) below)

4. Start the Add-on
5. Select "Watchdog" to restart the server if it crashes
6. (Optional) Select "Add to sidebar" for ease of use during thermostat configuration

### Manual Installation

1. Navigate to **Settings** > **Add-ons** > **Add-on Store**

2. Click the menu icon (three dots) in the top right and select **Repositories**

3. Add this repository URL:
   ```
   https://github.com/codykociemba/NoLongerEvil-HomeAssistant
   ```

4. Click **Add** and close the dialog

5. Find **NoLongerEvil HomeAssistant** in the store and click **Install**

## Requirements

- **Home Assistant OS** (not Home Assistant Container) - [Learn more](https://www.home-assistant.io/installation/#about-installation-types)
- **Mosquitto broker add-on** - Required for MQTT integration

## Configuration

After installing the add-on, configure it on the "Configuration" tab via the Home Assistant UI:

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `api_origin` | **Yes** | `http://<homeassistant_IP>:9543` | Full URL where Nest devices reach this add-on (protocol + host + port) |
| `entry_key_ttl_seconds` | No | `3600` | How long entry keys remain valid (seconds) |
| `debug_logging` | No | `false` | Enable verbose logging for troubleshooting |
| `mqtt_host` | No | (auto-detected) | MQTT broker hostname (leave empty to use Mosquitto add-on) |
| `mqtt_port` | No | `1883` | MQTT broker port |
| `mqtt_user` | No | (empty*) | MQTT username for authentication |
| `mqtt_password` | No | (empty*) | MQTT password for authentication |

* Fields can be empty under HAOS. Enter your credentials if you're using an external MQTT broker. 

### Example Configuration

```yaml
api_origin: "http://192.168.1.100:9543"
entry_key_ttl_seconds: 3600
debug_logging: false
```

### Network Ports

| Port | Purpose | Access |
|------|---------|--------|
| 9543 (host) → 8000 (container) | Nest device communication | External (configurable) |
| 8081 | Control API | Internal only |
| 8082 | Web UI | Ingress only |

## Thermostat Configuration - ssh
If the firmware flashing process (https://docs.nolongerevil.com/hosted/overview) did not ask how you want to connect the device, you'll need to configure the thermostat for self-hosting. (Choice of hosted or self-hosted feature during flashing is pending.)
1. ssh to your thermostat
   ```
   ssh root@<nest_ip>
   ```
2. Password is 
   ```
   nolongerevil
   ```
3. Use vi to edit the config file 
   ```
   vi /etc/nestlabs/client.config
   ```
5. Press "i" to edit
6. Find ```<a key="cloudregisterurl" value="https://backdoor.nolongerevil.com/"/>``` and update to 
   ```
   <a key="cloudregisterurl" value="http://<homeassistant_IP>:9543/entry"/>
   ```
   DO NOT OMIT /entry FROM THE URL
8. Press escape to exit vi edit mode, then ```:wq``` to write the file and quit the vi editor
9. Enter ```reboot``` to reboot your device.
10. Once rebooted, on the thermostat, go to Settings (gear icon) -> Nest App -> Get Entry Key to generate an entry key for device pairing.

## Register with NoLongerEvil Add-on in Home Assistant

1. Go to Home Assistant > Settings > Add Ons > NoLongerEvil HomeAssistant > Configuration
2. In the Home Assistant NLE Web UI, enter the 7-character pairing code from your Nest thermostat and click Register
3. Devices will appear in Home Assistant via MQTT discovery

## Community

- [NoLongerEvil Discord](https://discord.gg/nolongerevil) - Join `#nle-home-assistant` channel
- [GitHub Issues](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/issues) - Bug reports and feature requests

## Related Projects

- [NoLongerEvil Thermostat](https://github.com/codykociemba/NoLongerEvil-Thermostat) - Core API server
- [Home Assistant Nest Integration](https://github.com/will-tm/home-assistant-nolongerevil-thermostat) - Alternative integration

## Contributing

See the [CONTRIBUTING](CONTRIBUTING.md) guide for development setup instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
