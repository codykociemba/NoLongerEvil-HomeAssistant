/**
 * HTTP Request Handler for Web UI
 */

import * as http from 'http';
import * as url from 'url';
import { claimEntryKey, registerDeviceToUser, getDevicesForUser } from './device-registration';

/**
 * Main request handler
 */
export async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const reqUrl = req.url || '/';
  const method = req.method || 'GET';

  console.log(`[Frontend] ${method} ${reqUrl}`);

  // CORS headers for Ingress
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Ingress-Path');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Routes - match the end of the URL path to support both direct and Ingress access
    if (reqUrl === '/' || reqUrl.endsWith('/') || reqUrl.includes('/?')) {
      handleHome(req, res);
    } else if (reqUrl.endsWith('/api/devices')) {
      await handleDevices(req, res);
    } else if (reqUrl.endsWith('/api/register') && method === 'POST') {
      await handleRegister(req, res);
    } else {
      send404(res);
    }
  } catch (error) {
    console.error('[Frontend] Error:', error);
    sendError(res, 500, error instanceof Error ? error.message : 'Internal Server Error');
  }
}

/**
 * Home page handler
 */
function handleHome(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  // Get Ingress path from header (e.g., "/api/hassio_ingress/TOKEN")
  const ingressPathHeader = req.headers['x-ingress-path'];
  const ingressPath = Array.isArray(ingressPathHeader) ? ingressPathHeader[0] : (ingressPathHeader || '');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoLongerEvil - Device Management</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      background: #f5f5f5;
    }
    h1 { color: #333; }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .status { color: #4CAF50; font-weight: bold; }
  </style>
</head>
<body>
  <h1>🌡️ NoLongerEvil Device Management</h1>
  
  <div class="card">
    <h2>Welcome!</h2>
    <p class="status">✓ MQTT Integration Active</p>
    <p>Your NoLongerEvil server is running and ready to manage Nest thermostats.</p>
  </div>
  
  <div class="card">
    <h2>Quick Start</h2>
    <ol>
      <li>Generate an entry code for your Nest thermostat</li>
      <li>Enter the code on your device</li>
      <li>Device will appear here automatically</li>
    </ol>
  </div>
  
  <div class="card">
    <h2>Register Device</h2>
    <p>Enter the 7-character pairing code from your Nest thermostat:</p>
    <form id="registerForm">
      <input 
        type="text" 
        id="entryCode" 
        placeholder="123ABCD" 
        maxlength="7"
        style="padding: 10px; font-size: 16px; width: 150px; text-transform: uppercase;"
        required
      />
      <button 
        type="submit"
        style="padding: 10px 20px; font-size: 16px; margin-left: 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Register Device
      </button>
    </form>
    <div id="registerResult" style="margin-top: 15px;"></div>
  </div>
  
  <div class="card">
    <h2>Devices</h2>
    <div id="deviceList">
      <p><em>Loading devices...</em></p>
    </div>
    <button onclick="loadDevices()" style="margin-top: 10px;">Refresh Devices</button>
  </div>
  
  <script>
    // Get the Ingress base path (injected from server)
    const BASE_PATH = '${ingressPath}';
    
    // Auto-load devices on page load
    loadDevices();

    // Handle device registration form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('entryCode').value.toUpperCase().trim();
      const resultDiv = document.getElementById('registerResult');
      
      if (code.length !== 7) {
        resultDiv.innerHTML = '<p style="color: red;">Entry code must be 7 characters</p>';
        return;
      }
      
      resultDiv.innerHTML = '<p>Registering device...</p>';
      
      try {
        const response = await fetch(BASE_PATH + '/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            userId: 'homeassistant'
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          resultDiv.innerHTML = '<p style="color: green;">✓ ' + result.message + '</p>';
          document.getElementById('entryCode').value = '';
          setTimeout(loadDevices, 1000);
        } else {
          resultDiv.innerHTML = '<p style="color: red;">✗ ' + result.message + '</p>';
        }
      } catch (error) {
        resultDiv.innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
      }
    });
    
    async function loadDevices() {
      const deviceList = document.getElementById('deviceList');
      try {
        const response = await fetch(BASE_PATH + '/api/devices');
        const devices = await response.json();
        
        if (devices.length === 0) {
          deviceList.innerHTML = '<p><em>No devices registered yet</em></p>';
        } else {
          deviceList.innerHTML = '<ul>' + 
            devices.map(d => {
              const date = new Date(d.createdAt);
              return '<li><strong>' + d.serial + '</strong> - Registered ' + date.toLocaleString() + '</li>';
            }).join('') +
            '</ul>';
        }
      } catch (error) {
        deviceList.innerHTML = '<p style="color: red;">Error loading devices</p>';
      }
    }
  </script>
</body>
</html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

/**
 * Handle GET /api/devices
 */
async function handleDevices(
  _req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  try {
    const devices = await getDevicesForUser('homeassistant');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(devices));
  } catch (error) {
    console.error('[Frontend] Error fetching devices:', error);
    sendError(res, 500, 'Failed to fetch devices');
  }
}

/**
 * Handle POST /api/register
 */
async function handleRegister(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  try {
    const body = await readBody(req);
    const { code, userId } = JSON.parse(body);
    
    if (!code || !userId) {
      sendError(res, 400, 'Missing required fields: code, userId');
      return;
    }
    
    // Claim the entry key

    // Validate entry code format: must be exactly 7 alphanumeric characters
    if (typeof code !== 'string' || !/^[A-Z0-9]{7}$/i.test(code)) {
      sendError(res, 400, 'Invalid entry code format. Must be exactly 7 alphanumeric characters.');
      return;
    }

    // Normalize the code to uppercase
    const normalizedCode = code.toUpperCase().trim();

    // Claim the entry key
    const serial = await claimEntryKey(normalizedCode, userId);
    
    if (!serial) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Invalid, expired, or already claimed entry key'
      }));
      return;
    }
    
    // Register device to user
    await registerDeviceToUser(userId, serial);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      serial,
      message: `Device ${serial} registered to ${userId}`
    }));
  } catch (error) {
    console.error('[Frontend] Error registering device:', error);
    sendError(res, 500, error instanceof Error ? error.message : 'Failed to register device');
  }
}

/**
 * Read request body
 */
function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * Send 404 response
 */
function send404(res: http.ServerResponse): void {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

/**
 * Send error response
 */
function sendError(res: http.ServerResponse, code: number, message: string): void {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
}
