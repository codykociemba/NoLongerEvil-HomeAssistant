# Contributing to NoLongerEvil Home Assistant Add-on

Thank you for your interest in contributing!

## Development Setup

### Prerequisites

- Git
- Docker
- Home Assistant development environment (optional, for testing)

### Clone the Repository

```bash
git clone https://github.com/codykociemba/NoLongerEvil-HomeAssistant.git
cd NoLongerEvil-HomeAssistant

# Initialize submodules
git submodule update --init --recursive

# Configure sparse checkout for the vendor submodule
cd nolongerevil/vendor/nolongerevil
git config core.sparseCheckout true
git sparse-checkout set server
cd ../../..
```

### Local Development

Follow the [Home Assistant Add-on Development Tutorial](https://developers.home-assistant.io/docs/add-ons/tutorial/) to set up a local development environment.

### Building Locally

```bash
cd nolongerevil
docker build \
  --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest \
  -t nolongerevil-addon .
```

### Testing

1. Install the add-on in your Home Assistant development instance
2. Configure the add-on with your network settings
3. Verify the Web UI loads via Ingress
4. Test device pairing with a Nest thermostat

## Code Style

- Shell scripts: Follow [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- TypeScript: Use the existing ESLint configuration
- YAML: Use 2-space indentation

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run linters locally if possible
5. Commit with a descriptive message
6. Push to your fork
7. Open a Pull Request

## Community

Join the [NoLongerEvil Discord](https://discord.gg/nolongerevil) and find us in `#nle-home-assistant`.
