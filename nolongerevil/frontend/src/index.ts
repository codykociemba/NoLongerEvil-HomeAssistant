/**
 * NoLongerEvil Frontend - Ingress Web UI
 * 
 * Provides a simple web interface for device management
 * Handles device registration directly via SQLite database
 * Initializes MQTT integration on startup
 */

import * as http from 'http';
import { initializeMqtt } from './mqtt-init';
import { ensureHomeAssistantUser } from './device-registration';
import { handleRequest } from './server';

const PORT = parseInt(process.env.INGRESS_PORT || '8082');

async function start(): Promise<void> {
  console.log('[Frontend] Starting NoLongerEvil Web UI...');
  
  // Initialize MQTT integration first
  try {
    await initializeMqtt();
  } catch (error) {
    console.error('[Frontend] MQTT initialization failed:', error);
    process.exit(1);
  }
  
  // Ensure homeassistant user exists
  try {
    await ensureHomeAssistantUser();
  } catch (error) {
    console.error('[Frontend] Failed to create homeassistant user:', error);
    process.exit(1);
  }
  
  // Start web server
  const server = http.createServer(handleRequest);
  
  // Listen on all interfaces for Ingress
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Frontend] Web UI listening on port ${PORT}`);
    console.log('[Frontend] Ready for Ingress connections');
  });
}

start().catch(error => {
  console.error('[Frontend] Failed to start:', error);
  process.exit(1);
});
