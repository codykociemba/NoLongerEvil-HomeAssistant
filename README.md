![Build](https://github.com/codykociemba/NoLongerEvil-HomeAssistant/actions/workflows/build.yaml/badge.svg)
![License](https://img.shields.io/github/license/codykociemba/NoLongerEvil-HomeAssistant)

# Work In Progress

This add-on is currently in development. Please see these related resources for more information:

- https://github.com/will-tm/home-assistant-nolongerevil-thermostat
- https://github.com/codykociemba/NoLongerEvil-Thermostat/issues/55

# NoLongerEvil Home Assistant Add-on

A Home Assistant add-on that installs the NoLongerEvil Nest API inside your Home Assistant instance, and generates Home Assistant entities for the data it provides.

## Requirements

In order to use this add-on, you must be running Home Assistant OS (as distinct from Home Assistant Container) - please read https://www.home-assistant.io/installation/#about-installation-types for more information.

## Developers / Contributing

You can participate by following https://developers.home-assistant.io/docs/add-ons/tutorial/ to get started with developing with the add-on.

Join the [#nle-home-assistant](https://discord.com/channels/1153899255598157924/1441299147922870433) channel in the NoLongerEvil Discord to discuss any questions you have about the add-on.

## Setup

SSH into your Home Assistant OS server
Clone this repository into the addons folder, then initialize the submodules:

```bash
cd /addons
git clone https://github.com/codykociemba/NoLongerEvil-HomeAssistant.git

# Initialize and update submodules
git submodule update --init --recursive

# Configure sparse checkout for the NoLongerEvil submodule (only checks out the server folder)
cd vendor/nolongerevil
git config core.sparseCheckout true
git sparse-checkout set server
cd ../..
```

## Configuration

After installing the add-on, you can configure it through the Home Assistant UI:

### Options

- **`api_origin`** (REQUIRED): The full URL (including port) where Nest devices can reach this add-on

  - Must include the protocol, hostname/IP, and port
  - Examples:
    - `http://192.168.1.100:9543`
    - `http://homeassistant.local:9543`
    - `http://192.168.1.100:8054` (if you changed the port in Network settings)
  - **Important**: This must match the host port configured in the Network tab

- **`entry_key_ttl_seconds`** (default: `3600`): How long entry keys remain valid (in seconds)

  - Entry keys are used during device initialization
  - Default is 1 hour (3600 seconds)

- **`debug_logging`** (default: `false`): Enable verbose request/response logging
  - Useful for troubleshooting device communication issues
  - Creates detailed logs of all API requests

### Ports

The add-on listens on port **8000** inside the container for Nest device communication. This is mapped to host port **9543** by default (configurable in the Network settings):

- Container port **8000** → Host port **9543** (Nest devices, configurable via Network UI)
- Container port **8081** → Internal only (Control API)
- Container port **8082** → Ingress only (Web interface)

Users can change the host port in the Home Assistant add-on Network configuration if port 9543 conflicts with another service.

### Example Configuration

```yaml
api_origin: "http://192.168.1.100:9543" # REQUIRED: Your HA IP + port
entry_key_ttl_seconds: 3600 # 1 hour
debug_logging: false # Disable debug logs
