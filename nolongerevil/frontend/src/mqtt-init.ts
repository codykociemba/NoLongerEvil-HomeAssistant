/**
 * MQTT Integration Initialization
 * Runs on startup to configure MQTT in the database
 * Uses direct database access (no vendor dependencies)
 */

import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const DB_PATH = process.env.SQLITE3_DB_PATH || '/data/database.sqlite';
const DEFAULT_USER_ID = 'homeassistant';

/**
 * Open database connection
 */
async function openDb(): Promise<Database> {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

export async function initializeMqtt(): Promise<void> {
  console.log('[MQTT Init] Starting MQTT integration initialization...');

  // Check for required environment variables
  const mqttHost = process.env.MQTT_HOST;
  const mqttPort = process.env.MQTT_PORT;
  const mqttUser = process.env.MQTT_USER;
  const mqttPassword = process.env.MQTT_PASSWORD;

  if (!mqttHost || !mqttPort) {
    throw new Error('Missing MQTT configuration: MQTT_HOST and MQTT_PORT required');
  }

  console.log('[MQTT Init] MQTT configuration detected:');
  console.log(`[MQTT Init]   Host: ${mqttHost}`);
  console.log(`[MQTT Init]   Port: ${mqttPort}`);
  console.log(`[MQTT Init]   User: ${mqttUser || '(none)'}`);

  const db = await openDb();
  
  try {
    // Build MQTT broker URL
    const brokerUrl = `mqtt://${mqttHost}:${mqttPort}`;

    // Build MQTT configuration
    const mqttConfig = {
      brokerUrl,
      username: mqttUser || undefined,
      password: mqttPassword || undefined,
      clientId: `nolongerevil-${DEFAULT_USER_ID}`,
      topicPrefix: 'nolongerevil',
      discoveryPrefix: 'homeassistant',
      publishRaw: true,
      homeAssistantDiscovery: true,
    };

    console.log('[MQTT Init] Upserting MQTT integration config to database...');
    
    // Upsert the integration configuration
    // The integrations table has no id column - primary key is (userId, type)
    // Check if integration exists
    const existing = await db.get(
      'SELECT userId FROM integrations WHERE userId = ? AND type = ?',
      [DEFAULT_USER_ID, 'mqtt']
    );

    const configJson = JSON.stringify(mqttConfig);
    const nowMs = Date.now();

    if (existing) {
      // Update existing
      await db.run(
        'UPDATE integrations SET enabled = ?, config = ?, updatedAt = ? WHERE userId = ? AND type = ?',
        [1, configJson, nowMs, DEFAULT_USER_ID, 'mqtt']
      );
      console.log('[MQTT Init] Updated existing MQTT integration');
    } else {
      // Insert new
      await db.run(
        'INSERT INTO integrations (userId, type, enabled, config, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [DEFAULT_USER_ID, 'mqtt', 1, configJson, nowMs, nowMs]
      );
      console.log('[MQTT Init] Created new MQTT integration');
    }

    console.log('[MQTT Init] ✅ MQTT integration initialized successfully');
    console.log(`[MQTT Init]   User ID: ${DEFAULT_USER_ID}`);
    console.log(`[MQTT Init]   Broker: ${brokerUrl}`);
    console.log(`[MQTT Init]   Topic Prefix: nolongerevil`);
    console.log(`[MQTT Init]   HA Discovery: enabled`);
    
    // Verify the integration was written correctly
    const verify = await db.get(
      'SELECT userId, type, enabled, config FROM integrations WHERE userId = ? AND type = ?',
      [DEFAULT_USER_ID, 'mqtt']
    );
    
    if (verify) {
      console.log('[MQTT Init] ✅ Verified integration in database');
      console.log(`[MQTT Init]   Enabled: ${verify.enabled === 1 ? 'YES' : 'NO'}`);
      console.log(`[MQTT Init]   Server will detect this within 10 seconds`);
    } else {
      console.error('[MQTT Init] ❌ ERROR: Integration not found in database after insert!');
    }
  } finally {
    await db.close();
  }
}
