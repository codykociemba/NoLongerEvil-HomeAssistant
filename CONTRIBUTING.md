# Contributing to NoLongerEvil Home Assistant Add-on

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- Git
- Docker
- Home Assistant development environment (optional, for testing)

### Clone the Repository

```bash
# --recurse-submodules is required to clone the Python server (nolongerevil/server)
git clone --recurse-submodules https://github.com/codykociemba/NoLongerEvil-HomeAssistant.git
cd NoLongerEvil-HomeAssistant
```

### Local Development

Follow the [Home Assistant Add-on Development Tutorial](https://developers.home-assistant.io/docs/add-ons/tutorial/) to set up a local development environment.

### Building Locally

```bash
docker build -t nolongerevil-addon ./nolongerevil
```

### Testing

1. Install the add-on in your Home Assistant development instance
2. Configure the add-on with your network settings
3. Verify the Web UI loads via Ingress
4. Test device pairing with a Nest thermostat

> **Tip:** For easier local development, you can expose the dashboard directly by assigning a host port to container port `8082` under **Settings → Add-ons → NoLongerEvil → Configuration → Network**. This lets you access the UI at `http://<HA-IP>:8082` without going through Ingress.

## Code Style

- Shell scripts: Follow [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- Python: Follow [PEP 8](https://peps.python.org/pep-0008/) and use `ruff` for formatting (see the [server repo](https://github.com/codykociemba/NoLongerEvil-SelfHosted) for tooling config)
- YAML: Use 2-space indentation

## Understanding the Protocol

If you want to contribute to device communication or server logic, the Nest cloud protocol is documented in detail here:

[Nest Thermostat Protocol Reference](https://github.com/cjserio/nest-thermostat-protocol-docs/blob/main/NEST_CLOUD_PROTOCOL_REFERENCE.md) — a deep dive into the Nest communication protocol and how the device, transport, and subscription layers work together.

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run linters locally if possible
5. Commit with a descriptive message
6. Push to your fork
7. Open a Pull Request

## Community

Join the [Hack House Discord](https://discord.gg/hackhouse) and find us in `#nle-home-assistant`.
