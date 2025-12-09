# Changelog

All notable changes to this project will be documented in this file.

## [0.0.8] - Dec 8, 2025

### Python Server Migration

Migrated backend server from Node.js/TypeScript to Python for improved maintainability and performance.

### Changed

- Switched submodule from `NoLongerEvil-Thermostat` to `NoLongerEvil-SelfHosted` (feature/python-port branch)
- Backend server now runs on Python 3.12 with aiohttp, pydantic, and aiomqtt
- Dockerfile updated to install Python and pip instead of building Node.js server
- Server startup changed from `node dist/index.js` to `python3 -m nolongerevil.main`
- Removed unused TypeScript path mapping in frontend tsconfig

### Technical Details

- Python server uses same API endpoints and database schema for compatibility
- Frontend (Node.js) remains unchanged - still handles Ingress UI and MQTT initialization
- No changes to configuration options or port mappings

## [0.0.7] - Dec 6, 2025

### Device Availability Tracking and MQTT State Management Improvements

## Overview

Implements device availability tracking via watchdog, fixes MQTT fan mode handling, and corrects HVAC state reporting for Home Assistant integration.

### Device Availability Watchdog

**New `DeviceAvailabilityWatchdog` service:**

- Tracks device connectivity via `/entry` endpoints, PUT requests, and active SUBSCRIBE connections
- 5-minute timeout (300s) with 30-second check interval
- All devices start as unavailable until first activity
- Integrates with `IntegrationManager` to notify integrations of availability changes
- Monitors active long-polling subscriptions via `SubscriptionManager.getActiveSerials()`

### MQTT Integration Fixes

#### Fan Mode State Management

**Problem:** Fan mode was reverting in HA UI due to race conditions between MQTT commands and thermostat SUBSCRIBE responses.

- Atomic multi-field updates via new `updateDeviceFields()` method
- Immediate state republish after command execution (`publishHomeAssistantState()`)
- Created `deriveFanMode()` helper that prioritizes commanded state over physical state
- Fan on: sets `fan_control_state=true`, `fan_timer_active=true`, `fan_timer_timeout=(now+3600s)`
- Fan off: sets all three fields to false/0

#### HVAC Action & State Reporting

**Fixed incorrect state field lookups:**

- HVAC hardware state (`hvac_heater_state`, `hvac_ac_state`, `hvac_fan_state`) moved from `device.{serial}` to correct location in `shared.{serial}`
- Updated `deriveHvacAction()`, `isHeatingActive()`, `isCoolingActive()` helpers
- Added detailed logging for HVAC action and fan mode derivation

#### Home Assistant Discovery

**Dynamic temperature topic configuration:**

- `heat_cool` mode: only publishes `temperature_high` and `temperature_low` topics
- `heat`/`cool`/`off` modes: only publishes single `temperature` topic
- Discovery now republished on every state update to ensure config matches current mode
- Prevents HA errors when switching between single-setpoint and range modes

### Fan Timer Preservation Logic

**Enhanced `fanTimer.ts` to handle explicit fan-off commands:**

- New `isExplicitlyTurningOffFan()` check prevents preservation when device sends `fan_timer_timeout: 0` or `fan_control_state: false`
- Preservation logic now takes incoming values into account, not just existing state
- Fixes issue where thermostat's manual fan-off was being overridden by stale server state

### Subscription Management

**Removed automatic subscription timeout:**

- `SUBSCRIPTION_TIMEOUT_MS` now defaults to `Number.POSITIVE_INFINITY` (disabled)
- Allows thermostat to maintain long-polling connections indefinitely
- Prevents server from prematurely closing connections and forcing thermostat into PUT-only mode
- Enhanced logging with timestamps for subscription lifecycle events

### Upload Route

**Fixed log directory creation:**

- `handleUpload()` now ensures `DEBUG_LOGS_DIR` exists before writing
- Allows upload logs to work even when `DEBUG_LOGGING=false`

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
