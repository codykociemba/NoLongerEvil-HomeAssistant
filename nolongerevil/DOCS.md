# NoLongerEvil Home Assistant Add-on

Self-hosted Nest thermostat control via the NoLongerEvil API.

## How it works

This add-on runs a local API server that communicates with your Nest thermostat. When paired, your thermostat connects directly to this server instead of Google's cloud, giving you full local control.

The add-on integrates with Home Assistant through MQTT discovery, automatically creating climate entities for your thermostats.

## Prerequisites

Before installing this add-on:

1. **Install the Mosquitto broker add-on** from the official add-on store
2. **Start the Mosquitto broker** and ensure it's running
3. **Note your Home Assistant's IP address** - you'll need this for configuration

## Configuration

### api_origin (required)

The full URL where your Nest devices can reach this add-on. This must be accessible from your local network.

Format: `http://<ip-or-hostname>:<port>`

Examples:
- `http://192.168.1.100:9543`
- `http://homeassistant.local:9543`

**Important**: The port must match the host port configured in the Network settings (default: 9543).

### entry_key_ttl_seconds

How long device pairing codes remain valid. Default is 3600 seconds (1 hour).

### debug_logging

Enable verbose logging for troubleshooting device communication issues. Logs are stored in `/data/debug-logs/`.

## Pairing a Device

1. Open the add-on Web UI
2. Click **Generate Entry Key**
3. Note the 7-character code displayed
4. On your Nest thermostat, navigate to Settings > Reset > Network
5. When prompted, enter the entry key
6. The thermostat will connect to your local server

## Troubleshooting

### Thermostat won't connect

- Verify `api_origin` is correct and reachable from your network
- Check that port 9543 (or your configured port) is not blocked by a firewall
- Ensure the entry key hasn't expired
- Enable `debug_logging` and check the add-on logs

### MQTT entities not appearing

- Verify the Mosquitto broker add-on is running
- Check the add-on logs for MQTT connection errors
- Restart the add-on after ensuring Mosquitto is running

### Entry key invalid

- Entry keys expire after `entry_key_ttl_seconds` (default 1 hour)
- Generate a new entry key and try again

## Support

- [GitHub Issues](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/issues)
- [Discord](https://discord.gg/nolongerevil) - `#nle-home-assistant` channel
