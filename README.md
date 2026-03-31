# NoLongerEvil Home Assistant Add-on

[![Build Status](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/actions/workflows/build.yaml/badge.svg)](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/actions/workflows/build.yaml)
[![License](https://img.shields.io/github/license/codykociemba/NoLongerEvil-HomeAssistant)](LICENSE)
[![Release](https://img.shields.io/github/v/release/codykociemba/NoLongerEvil-HomeAssistant)](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/releases/latest)
[![Home Assistant Add-on](https://img.shields.io/badge/Home%20Assistant-Add--on-blue.svg)](https://www.home-assistant.io/addons/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Us-5865F2?logo=discord&logoColor=white)](https://discord.gg/hackhouse)

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
| `api_origin` | **Yes** | `http://192.168.1.x:9543` | Full URL where Nest devices reach this add-on (protocol + host + port). **Always use an IP address** — do not use `homeassistant.local` as mDNS can fail for Nest devices |
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
| 8082 | Control API + Web UI | Ingress only (default) |

By default the dashboard is only accessible via the HA sidebar through Ingress. If you want direct access at `http://<HA-IP>:<port>` (e.g. for development or external tools), go to **Settings → Add-ons → NoLongerEvil → Configuration → Network** and assign a host port to container port `8082`, then restart the add-on.

## Thermostat Setup

### Automated Setup (Recommended)

The No Longer Evil firmware installer handles thermostat configuration automatically:

1. Flash your Nest thermostat using the [No Longer Evil firmware installer](https://docs.nolongerevil.com/hosted/overview)
2. During flashing, select **Self-Hosted** when asked how you want to connect
3. The installer will scan your LAN for a running No Longer Evil add-on and configure the thermostat automatically using the add-on's `/info` endpoint
4. Once flashing completes, open the add-on Web UI and the thermostat will appear in the device list

### Manual Setup (Fallback)

Use this if the firmware installer could not auto-configure your thermostat.

**SSH credentials:** The default username is `root` and default password is `nolongerevil`. However, if the firmware installer prompted you to set a password during the flashing process, use that password instead. The default `nolongerevil` password applies to older devices or installs that skipped the password step.

1. SSH to your thermostat:
   ```
   ssh root@<nest_ip>
   ```

2. Enter your password (default: `nolongerevil` — see note above)

3. Edit the config file:
   ```
   vi /etc/nestlabs/client.config
   ```

4. Press `i` to enter edit mode

5. Find `<a key="cloudregisterurl" .../>` and update it to:
   ```
   <a key="cloudregisterurl" value="http://<homeassistant_IP>:9543/entry"/>
   ```
   > **Tip:** Not sure of your IP? Query `http://<homeassistant_IP>:9543/info` from any browser on your network — the `cloudregisterurl` field in the response is the exact value to use here.

   > **Do not omit `/entry` from the URL.**

6. Press `Escape`, then type `:wq` to save and quit

7. Reboot the thermostat:
   ```
   reboot
   ```

8. Once rebooted, on the thermostat go to **Settings (gear icon) → Nest App → Get Entry Key** to generate a pairing code

### Pairing in Home Assistant

> **Note:** Pairing is only required if `require_device_pairing` is enabled in the add-on configuration (disabled by default). If it's disabled, your thermostat will connect and appear automatically without needing a pairing code.

If pairing is enabled:

1. Open the add-on Web UI via the **Open Web UI** button
2. Enter the 7-character pairing code from your thermostat and click **Register**
3. The thermostat will appear in Home Assistant via MQTT discovery

## Community

- [HackHouse Discord](https://discord.gg/hackhouse) - Join `#nle-home-assistant` channel
- [GitHub Issues](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/issues) - Bug reports and feature requests

## Video Tutorial

Need help getting set up? Watch the walkthrough:

[![How to setup HA Addon](https://img.youtube.com/vi/Jz0Ze9F7uM0/0.jpg)](https://youtu.be/Jz0Ze9F7uM0?t=682)

## Related Projects

- [NoLongerEvil SelfHosted](https://github.com/codykociemba/NoLongerEvil-SelfHosted) - Python server powering this add-on
- [Home Assistant Nest Integration](https://github.com/will-tm/home-assistant-nolongerevil-thermostat) - Alternative integration

**Hardware Alternative:** If you're interested in the hardware side of things, check out [sett.homes](https://sett.homes) for a drop-in PCB replacement option.

## Resources

- [Nest Thermostat Protocol Reference](https://github.com/cjserio/nest-thermostat-protocol-docs/tree/main) - Deep dive into the Nest communication protocol and how the device, transport, and subscription layers work together (credit: [@cjserio](https://github.com/cjserio))

## About

NoLongerEvil is created and maintained by [Hack House](https://hackhouse.io) and our open source contributors. Contributors are recognized in the `#nle-home-assistant` channel on [Discord](https://discord.gg/hackhouse) with the **NLE Contributor** role.

## Contributing

See the [CONTRIBUTING](CONTRIBUTING.md) guide for development setup instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
