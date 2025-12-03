#!/usr/bin/with-contenv bashio
# shellcheck shell=bash

bashio::log.info "Starting NoLongerEvil Add-on..."

# Read user configuration from options
DEBUG_LOGGING=$(bashio::config 'debug_logging')
ENTRY_KEY_TTL_SECONDS=$(bashio::config 'entry_key_ttl_seconds')

# Container always listens on these ports
PROXY_PORT=8000
CONTROL_PORT=8081
INGRESS_PORT=8082

# Get API_ORIGIN from user config (REQUIRED - must include port)
if bashio::config.has_value 'api_origin'; then
    API_ORIGIN=$(bashio::config 'api_origin')
    bashio::log.info "Using configured API origin: ${API_ORIGIN}"

    # Validate api_origin format: must be a valid URL with protocol and port
    if ! echo "${API_ORIGIN}" | grep -qE '^https?://[^/:]+:[0-9]+$'; then
        bashio::log.fatal "api_origin must be a valid URL with protocol, hostname, and port"
        bashio::log.fatal "Current value: ${API_ORIGIN}"
        bashio::log.fatal "Expected format: http://<hostname-or-ip>:<port>"
        bashio::log.fatal "Examples:"
        bashio::log.fatal "  http://192.168.1.100:9543"
        bashio::log.fatal "  http://homeassistant.local:9543"
        exit 1
    fi
else
    bashio::log.fatal "api_origin is required! Please configure it in the add-on settings."
    bashio::log.fatal "Example: http://192.168.1.100:9543"
    exit 1
fi

# Check if MQTT service is available (REQUIRED)
bashio::log.info "Checking for MQTT service..."
if bashio::services "mqtt" "host" > /dev/null 2>&1; then
    bashio::log.info "MQTT service IS available from Supervisor"
    
    # Extract MQTT credentials from Supervisor services API
    MQTT_HOST=$(bashio::services "mqtt" "host")
    export MQTT_HOST
    MQTT_PORT=$(bashio::services "mqtt" "port")
    export MQTT_PORT
    MQTT_USER=$(bashio::services "mqtt" "username")
    export MQTT_USER
    MQTT_PASSWORD=$(bashio::services "mqtt" "password")
    export MQTT_PASSWORD
    
    bashio::log.info "MQTT service configured:"
    bashio::log.info "  Host: ${MQTT_HOST}"
    bashio::log.info "  Port: ${MQTT_PORT}"
    bashio::log.info "  User: ${MQTT_USER}"
else
    bashio::log.fatal "MQTT service is NOT available!"
    bashio::log.fatal "This add-on requires the Mosquitto broker add-on."
    bashio::log.fatal "Please install and start the Mosquitto broker add-on first."
    bashio::log.fatal ""
    bashio::log.fatal "Installation steps:"
    bashio::log.fatal "  1. Go to Settings > Add-ons > Add-on Store"
    bashio::log.fatal "  2. Search for 'Mosquitto broker'"
    bashio::log.fatal "  3. Install the official Mosquitto broker add-on"
    bashio::log.fatal "  4. Start the Mosquitto broker"
    bashio::log.fatal "  5. Restart this add-on"
    exit 1
fi

# Set environment variables for Node.js
export API_ORIGIN
export PROXY_PORT
export CONTROL_PORT
export INGRESS_PORT
export ENTRY_KEY_TTL_SECONDS
export DEBUG_LOGGING
export DEBUG_LOGS_DIR=/data/debug-logs
export SQLITE3_ENABLED=true
export SQLITE3_DB_PATH=/data/database.sqlite

bashio::log.info "Configuration:"
bashio::log.info "  API_ORIGIN: ${API_ORIGIN}"
bashio::log.info "  PROXY_PORT: ${PROXY_PORT} (container listen port)"
bashio::log.info "  CONTROL_PORT: ${CONTROL_PORT}"
bashio::log.info "  INGRESS_PORT: ${INGRESS_PORT}"
bashio::log.info "  DEBUG_LOGGING: ${DEBUG_LOGGING}"
bashio::log.info "  MQTT_HOST: ${MQTT_HOST}"
bashio::log.info "  MQTT_PORT: ${MQTT_PORT}"
bashio::log.info ""
bashio::log.info "Nest devices will connect to: ${API_ORIGIN}"

# Start the vendor API server FIRST (creates database tables)
bashio::log.info "Starting API server..."
cd /server || exit 1
node dist/index.js &
SERVER_PID=$!
bashio::log.info "API server started (PID: ${SERVER_PID})"

# Wait for server to initialize database
bashio::log.info "Waiting for database initialization..."
MAX_WAIT=30
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  if [ -f /data/database.sqlite ]; then
    bashio::log.info "Database ready"
    break
  fi
  sleep 1
  WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $WAIT_COUNT -eq $MAX_WAIT ]; then
  bashio::log.fatal "Database initialization timeout after ${MAX_WAIT} seconds"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

# Start the frontend (Ingress UI + MQTT initialization)
bashio::log.info "Starting frontend web UI..."
cd /frontend || exit 1
node dist/index.js &
FRONTEND_PID=$!
bashio::log.info "Frontend started (PID: ${FRONTEND_PID})"

# Wait for any process to exit (both should stay running)
wait -n $FRONTEND_PID $SERVER_PID
EXIT_CODE=$?

# If one exits, kill the other
bashio::log.warning "A process exited with code ${EXIT_CODE}, shutting down..."
kill $FRONTEND_PID $SERVER_PID 2>/dev/null
exit $EXIT_CODE
