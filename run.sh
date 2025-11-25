#!/usr/bin/with-contenv bashio

bashio::log.info "Starting NoLongerEvil Add-on..."

# Set environment variables for the Node.js app
export API_ORIGIN="${API_ORIGIN:-http://localhost}"
export PROXY_PORT=80
export CONTROL_PORT=8081
export ENTRY_KEY_TTL_SECONDS=3600
export DEBUG_LOGGING=false
export SQLITE3_ENABLED=true
export SQLITE3_DB_PATH=/data/database.sqlite

bashio::log.info "Environment configured:"
bashio::log.info "  - PROXY_PORT: ${PROXY_PORT}"
bashio::log.info "  - CONTROL_PORT: ${CONTROL_PORT}"
bashio::log.info "  - SQLITE3_DB_PATH: ${SQLITE3_DB_PATH}"

# Change to app directory and start the Node.js server
cd /app
bashio::log.info "Starting Node.js server..."
exec node dist/index.js
