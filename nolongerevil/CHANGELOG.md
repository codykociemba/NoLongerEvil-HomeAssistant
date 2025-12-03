# Changelog

All notable changes to this project will be documented in this file.

## [0.0.5] - 2024

### Changed
- Repository restructured for Home Assistant add-on store compatibility
- Add-on moved to `nolongerevil/` subdirectory for proper repository format
- Improved CI/CD pipeline with multi-architecture builds (all 5 architectures)
- Added Home Assistant add-on linter to CI
- Updated documentation with installation badges and quick-install button
- Added `url` and `panel_icon` to config

### Added
- `repository.yaml` for add-on store discovery
- `DOCS.md` for in-app documentation
- `CONTRIBUTING.md` for developer guidelines
- One-click installation button in README

## [0.0.4] - 2024

### Fixed
- Linter errors resolved
- Removed `dist` folder from Git tracking

## [0.0.3] - 2024

### Added
- Initial public release
- SQLite backend support
- MQTT discovery integration
- Device registration via entry keys
- Web UI for device management
