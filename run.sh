#!/usr/bin/with-contenv bashio
# shellcheck shell=bash

bashio::log.info "Starting NoLongerEvil Add-on..."

# Read user configuration from options
DEBUG_LOGGING=$(bashio::config 'debug_logging')
ENTRY_KEY_TTL_SECONDS=$(bashio::config 'entry_key_ttl_seconds')

# Container always listens on these ports
PROXY_PORT=8000
CONTROL_PORT=8081

# Get API_ORIGIN from user config (REQUIRED - must include port)
if bashio::config.has_value 'api_origin'; then
    API_ORIGIN=$(bashio::config 'api_origin')
    bashio::log.info "Using configured API origin: ${API_ORIGIN}"
else
    bashio::log.fatal "api_origin is required! Please configure it in the add-on settings."
    bashio::log.fatal "Example: http://192.168.1.100:9543"
    exit 1
fi

# Set environment variables for Node.js
export API_ORIGIN
export PROXY_PORT
export CONTROL_PORT
export ENTRY_KEY_TTL_SECONDS
export DEBUG_LOGGING
export SQLITE3_ENABLED=true
export SQLITE3_DB_PATH=/data/database.sqlite

bashio::log.info "Configuration:"
bashio::log.info "  API_ORIGIN: ${API_ORIGIN}"
bashio::log.info "  PROXY_PORT: ${PROXY_PORT} (container listen port)"
bashio::log.info "  CONTROL_PORT: ${CONTROL_PORT}"
bashio::log.info "  DEBUG_LOGGING: ${DEBUG_LOGGING}"
bashio::log.info ""
bashio::log.info "Nest devices will connect to: ${API_ORIGIN}"

# Change to app directory and start the Node.js server
cd /app || exit 1
bashio::log.info "Starting Node.js server..."
exec node dist/index.js
