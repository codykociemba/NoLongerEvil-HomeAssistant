#!/usr/bin/with-contenv bashio
# shellcheck shell=bash
bashio::log.info "Starting NoLongerEvil Add-on..."

# Read options from Home Assistant
OPTIONS_FILE="/data/options.json"

if [ -f "$OPTIONS_FILE" ]; then
  export API_ORIGIN="$(jq -r '.api_origin // "http://localhost"' "$OPTIONS_FILE")"
  export PROXY_PORT="$(jq -r '.proxy_port // 8000' "$OPTIONS_FILE")"
  export CONTROL_PORT="$(jq -r '.control_port // 8081' "$OPTIONS_FILE")"
  export ENTRY_KEY_TTL_SECONDS="$(jq -r '.entry_ttl // 3600' "$OPTIONS_FILE")"
  export DEBUG_LOGGING="$(jq -r '.debug_logging // false' "$OPTIONS_FILE")"
  export MQTT_ENABLED="$(jq -r '.mqtt_enabled // false' "$OPTIONS_FILE")"
  export MQTT_HOST="$(jq -r '.mqtt_host // "homeassistant.local"' "$OPTIONS_FILE")"
  export MQTT_PORT="$(jq -r '.mqtt_port // 1883' "$OPTIONS_FILE")"
  export MQTT_USERNAME="$(jq -r '.mqtt_username // ""' "$OPTIONS_FILE")"
  export MQTT_PASSWORD="$(jq -r '.mqtt_password // ""' "$OPTIONS_FILE")"
  export MQTT_TOPIC_PREFIX="$(jq -r '.mqtt_topic_prefix // "nolongerevil"' "$OPTIONS_FILE")"
else
  export API_ORIGIN="https://localhost"
  export PROXY_PORT=8000
  export CONTROL_PORT=8081
  export ENTRY_KEY_TTL_SECONDS=3600
  export DEBUG_LOGGING=false
fi

export SQLITE3_ENABLED=true
export SQLITE3_DB_PATH=/data/database.sqlite

bashio::log.info "Environment configured:"
bashio::log.info "  - API_ORIGIN: ${API_ORIGIN}"
bashio::log.info "  - PROXY_PORT: ${PROXY_PORT}"
bashio::log.info "  - CONTROL_PORT: ${CONTROL_PORT}"
bashio::log.info "  - SQLITE3_DB_PATH: ${SQLITE3_DB_PATH}"

# Change to app directory and start the Node.js server
cd /app || exit 1
bashio::log.info "Starting Node.js server..."
exec node dist/index.js
