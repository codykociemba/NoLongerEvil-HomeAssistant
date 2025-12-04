/**
 * Device Registration Module
 * 
 * Handles device registration directly via SQLite database
 * Similar to mqtt-init.ts - keeps vendor code clean
 */

import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const DB_PATH = process.env.SQLITE3_DB_PATH || '/data/database.sqlite';

/**
 * Open database connection
 */
async function openDb(): Promise<Database> {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

/**
 * Create the 'homeassistant' user if it doesn't exist
 */
export async function ensureHomeAssistantUser(): Promise<void> {
  const db = await openDb();
  
  try {
    const userId = 'homeassistant';
    const email = 'homeassistant@local';
    
    // Check if user exists
    const existing = await db.get(
      'SELECT clerkId FROM users WHERE clerkId = ?',
      [userId]
    );
    
    if (existing) {
      console.log('[DeviceReg] User "homeassistant" already exists');
    } else {
      const nowMs = Date.now();
      await db.run(
        'INSERT INTO users (clerkId, email, createdAt) VALUES (?, ?, ?)',
        [userId, email, nowMs]
      );
      console.log('[DeviceReg] ✅ Created user "homeassistant"');
    }
  } finally {
    await db.close();
  }
}

/**
 * Claim an entry key and return the device serial
 */
export async function claimEntryKey(code: string, userId: string): Promise<string | null> {
  const db = await openDb();
  
  try {
    const nowMs = Date.now();
    
    // Get entry key
    const row = await db.get<any>(
      'SELECT code, serial, expiresAt, claimedBy FROM entryKeys WHERE code = ?',
      [code]
    );
    
    if (!row) {
      console.warn(`[DeviceReg] Entry key not found: ${code}`);
      return null;
    }
    
    // Check if expired
    if (row.expiresAt < nowMs) {
      console.warn(`[DeviceReg] Entry key expired: ${code}`);
      return null;
    }
    
    // Check if already claimed
    if (row.claimedBy) {
      console.warn(`[DeviceReg] Entry key already claimed: ${code}`);
      return null;
    }
    
    // Mark as claimed
    await db.run(
      'UPDATE entryKeys SET claimedBy = ?, claimedAt = ? WHERE code = ?',
      [userId, nowMs, code]
    );
    
    console.log(`[DeviceReg] ✅ Claimed entry key ${code} for device ${row.serial}`);
    return row.serial;
  } finally {
    await db.close();
  }
}

/**
 * Register device to user (create ownership record)
 */
export async function registerDeviceToUser(userId: string, serial: string): Promise<void> {
  const db = await openDb();
  
  try {
    const nowMs = Date.now();
    
    // Check if already registered
    const existing = await db.get(
      'SELECT userId FROM deviceOwners WHERE serial = ?',
      [serial]
    );
    
    if (existing) {
      console.warn(`[DeviceReg] Device ${serial} already registered to ${existing.userId}`);
      return;
    }
    
    // Insert ownership record
    await db.run(
      'INSERT INTO deviceOwners (userId, serial, createdAt) VALUES (?, ?, ?)',
      [userId, serial, nowMs]
    );
    
    console.log(`[DeviceReg] ✅ Registered device ${serial} to user ${userId}`);
  } finally {
    await db.close();
  }
}

/**
 * Get list of device serials owned by a user
 * Note: Full device state is stored in-memory by the server, not in the DB
 * This only returns the ownership records (serial numbers)
 */
export async function getDevicesForUser(userId: string): Promise<Array<{ serial: string; createdAt: number }>> {
  const db = await openDb();

  try {
    const devices = await db.all(
      `SELECT serial, createdAt
       FROM deviceOwners
       WHERE userId = ?
       ORDER BY createdAt DESC`,
      [userId]
    );

    return devices;
  } finally {
    await db.close();
  }
}

/**
 * Delete a device ownership record for a user
 */
export async function deleteDeviceForUser(userId: string, serial: string): Promise<boolean> {
  const db = await openDb();

  try {
    const result = await db.run(
      'DELETE FROM deviceOwners WHERE userId = ? AND serial = ?',
      [userId, serial]
    );

    if (result.changes && result.changes > 0) {
      console.log(`[DeviceReg] ✅ Deleted device ${serial} for user ${userId}`);
      return true;
    }

    console.warn(`[DeviceReg] Device ${serial} not found for user ${userId}`);
    return false;
  } finally {
    await db.close();
  }
}
