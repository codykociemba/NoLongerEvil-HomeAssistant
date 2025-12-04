# Changelog

All notable changes to this project will be documented in this file.

## [0.0.6] - 2025

### Added
- Device deletion from web UI
- DELETE /api/devices/:serial endpoint for removing device ownership
- Automatic Home Assistant discovery cleanup when device is deleted

## [0.0.5] - 2025

### Changed
- Repository restructured for Home Assistant add-on store compatibility
- Add-on moved to `nolongerevil/` subdirectory for proper repository format
- Improved CI/CD pipeline with multi-architecture builds (amd64, aarch64)
- Removed deprecated architectures (armhf, armv7, i386) per Home Assistant 2025.12
- Removed `hassio_role` config (uses default value)
- Added Home Assistant add-on linter to CI
- Updated documentation with installation badges and quick-install button
- Added `url` and `panel_icon` to config

### Added
- Manual MQTT broker configuration (mqtt_host, mqtt_port, mqtt_user, mqtt_password)
- Fallback to Supervisor MQTT auto-discovery when manual config not provided
- `repository.yaml` for add-on store discovery
- `DOCS.md` for in-app documentation
- `CONTRIBUTING.md` for developer guidelines
- One-click installation button in README
- Add-on icon and logo

### Fixed
- Fixed MQTT integration not loading (getAllEnabledMqttIntegrations was returning null)
- Fixed hardcoded log values in mqtt-init.ts

## [0.0.4] - 2025

### Fixed
- Linter errors resolved
- Removed `dist` folder from Git tracking

## [0.0.3] - 2025

### Added
- Initial public release
- SQLite backend support
- MQTT discovery integration
- Device registration via entry keys
- Web UI for device management
