import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import Zeroconf from 'react-native-zeroconf';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const CONNECTION_KEY = 'pictureframe_connection';

// Ports the PictureFrame server commonly runs on
const SCAN_PORTS = [5000, 3000, 8000, 8080];

class NetworkService {
  connectedServer = null;
  isScanning = false;
  scanAbortController = null;

  constructor() {
    this.loadSavedConnection();
    console.log('NetworkService initialized');
  }

  // ─── Persistence ────────────────────────────────────────────────

  async loadSavedConnection() {
    try {
      const saved = await SecureStore.getItemAsync(CONNECTION_KEY);
      if (!saved) {
        this.connectedServer = null;
        return false;
      }

      const connection = JSON.parse(saved);
      if (connection?.ip && connection?.port) {
        this.connectedServer = connection;
        console.log('Loaded saved connection:', connection);

        // Background-verify without blocking
        this.checkServer(connection.ip, connection.port, 5000)
          .then(r => {
            if (!r.success) console.log('Saved connection no longer responding');
          })
          .catch(() => {});
        return true;
      }
    } catch (error) {
      console.error('Failed to load saved connection:', error?.message);
      await SecureStore.deleteItemAsync(CONNECTION_KEY).catch(() => {});
      this.connectedServer = null;
    }
    return false;
  }

  async saveConnection(ip, port) {
    this.connectedServer = { ip, port };
    try {
      await SecureStore.setItemAsync(CONNECTION_KEY, JSON.stringify({ ip, port }));
      console.log('Connection saved:', { ip, port });
      return true;
    } catch (error) {
      console.error('Failed to save connection:', error?.message);
      return false;
    }
  }

  async clearConnection() {
    this.connectedServer = null;
    try {
      await SecureStore.deleteItemAsync(CONNECTION_KEY);
      console.log('Connection cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear connection:', error?.message);
      return false;
    }
  }

  getApiBaseUrl() {
    if (!this.connectedServer) return null;
    const { ip, port } = this.connectedServer;
    return `http://${ip}:${port}/api`;
  }

  // ─── Server Validation ──────────────────────────────────────────

  async checkServer(ip, port = 5000, timeout = 3000) {
    if (!this.isValidIpAddress(ip)) {
      return { success: false, reason: 'Invalid IP address format' };
    }

    try {
      const url = `http://${ip}:${port}/api/images`;
      const response = await axios.get(url, {
        timeout,
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (Array.isArray(response.data)) {
        console.log(`Found server at ${ip}:${port}`);
        this.connectedServer = { ip, port };
        return { success: true, ip, port };
      }

      return { success: false, reason: 'Not a picture frame server' };
    } catch (error) {
      let reason = 'Unknown error';
      if (error.code === 'ECONNABORTED') reason = 'Connection timeout';
      else if (error.code === 'ECONNREFUSED') reason = 'Connection refused';
      else if (error.response) reason = `HTTP ${error.response.status}`;
      else if (error.message) reason = error.message;

      return { success: false, reason, code: error.code };
    }
  }

  isValidIpAddress(ip) {
    if (typeof ip !== 'string') return false;
    const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return false;
    return m.slice(1).every(o => {
      const n = parseInt(o);
      return n >= 0 && n <= 255;
    });
  }

  // ─── Permissions ────────────────────────────────────────────────

  async ensureLocationPermission() {
    if (Platform.OS !== 'android') return true;
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') return true;

      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      return newStatus === 'granted';
    } catch (error) {
      console.log('Location permission error:', error?.message);
      return false;
    }
  }

  // ─── Network Info ───────────────────────────────────────────────

  async getNetworkInfo() {
    try {
      if (Platform.OS === 'android') {
        await this.ensureLocationPermission();
      }

      const netInfo = await NetInfo.fetch();
      console.log('NetInfo result:', JSON.stringify(netInfo));

      // Check for IP in details regardless of connection type
      // Some devices/routers report type differently (e.g. 'other' instead of 'wifi')
      const ip = netInfo.details?.ipAddress;
      if (ip && this.isValidIpAddress(ip)) {
        const parts = ip.split('.');
        return {
          success: true,
          ipAddress: ip,
          subnet: `${parts[0]}.${parts[1]}.${parts[2]}`,
          gateway: netInfo.details.gateway || `${parts[0]}.${parts[1]}.${parts[2]}.1`,
        };
      }
    } catch (error) {
      console.log('NetInfo error:', error?.message);
    }

    // Fallback: try to discover our subnet by probing common gateways
    console.log('NetInfo did not return an IP, trying gateway probes...');
    const gatewayProbes = [
      '192.168.86.1',  // Google Wifi / Nest
      '192.168.1.1',   // Most common
      '192.168.0.1',   // Common alternative
      '10.0.0.1',      // Some ISPs
      '192.168.2.1',   // Some routers
      '192.168.10.1',  // Some business routers
      '172.16.0.1',    // Private range
    ];

    for (const gw of gatewayProbes) {
      try {
        await axios.get(`http://${gw}`, { timeout: 800 });
        // If we get any response (even an error page), this gateway exists
        const parts = gw.split('.');
        console.log(`Gateway probe hit: ${gw}`);
        return {
          success: true,
          ipAddress: gw,
          subnet: `${parts[0]}.${parts[1]}.${parts[2]}`,
          gateway: gw,
        };
      } catch (error) {
        // ECONNREFUSED means something is there, just not serving HTTP
        if (error?.code === 'ECONNREFUSED') {
          const parts = gw.split('.');
          console.log(`Gateway probe refused but reachable: ${gw}`);
          return {
            success: true,
            ipAddress: gw,
            subnet: `${parts[0]}.${parts[1]}.${parts[2]}`,
            gateway: gw,
          };
        }
        // Timeout or unreachable — try next
      }
    }

    // Last resort fallback
    console.log('All gateway probes failed, using default 192.168.1');
    return {
      success: true,
      ipAddress: '192.168.1.100',
      subnet: '192.168.1',
      gateway: '192.168.1.1',
    };
  }

  async checkNetworkStatus() {
    try {
      const status = {
        isConnected: false,
        isWifi: false,
        ipAddress: null,
        wifiName: null,
        internetAccess: false,
        locationPermission: 'unknown',
        hasNetInfo: true,
      };

      if (Platform.OS === 'android') {
        try {
          const { status: permStatus } = await Location.getForegroundPermissionsAsync();
          status.locationPermission = permStatus;
        } catch {
          status.locationPermission = 'error';
        }
      }

      try {
        const netInfo = await NetInfo.fetch();
        status.isConnected = !!netInfo.isConnected;
        status.isWifi = netInfo.type === 'wifi';
        status.ipAddress = netInfo.details?.ipAddress || null;
        status.wifiName = netInfo.details?.ssid || null;
        status.internetAccess = netInfo.isInternetReachable === true;
      } catch {
        status.hasNetInfo = false;
      }

      // If NetInfo didn't confirm internet, try a quick fetch
      if (!status.internetAccess && status.isConnected) {
        try {
          await fetch('https://clients3.google.com/generate_204', {
            method: 'HEAD',
            cache: 'no-cache',
          });
          status.internetAccess = true;
        } catch {
          // leave as false
        }
      }

      return status;
    } catch (error) {
      console.error('Network status check error:', error?.message);
      return null;
    }
  }

  // ─── Abort ──────────────────────────────────────────────────────

  abortScan() {
    if (this.isScanning && this.scanAbortController) {
      this.scanAbortController.abort();
      this.isScanning = false;
      console.log('Scan aborted');
    }
  }

  // ─── Main Scan Entry Point ──────────────────────────────────────

  async scanNetwork(options = {}) {
    if (this.isScanning) this.abortScan();

    const {
      maxConcurrent = 20,
      timeout = 3000,
      useZeroconf = true,
      onProgress = null,
      ports = SCAN_PORTS,
    } = options;

    // Web platform can't scan
    if (Platform.OS === 'web') {
      return {
        success: false,
        reason: 'Network scanning is not available in the web browser. Use manual connection.',
      };
    }

    // Check permissions on Android
    if (Platform.OS === 'android') {
      const hasPermission = await this.ensureLocationPermission();
      if (!hasPermission) {
        return {
          success: false,
          reason: 'Location permission required for network scanning on Android',
          permissionDenied: true,
        };
      }
    }

    this.isScanning = true;
    this.scanAbortController = new AbortController();
    const signal = this.scanAbortController.signal;
    const results = [];
    let scanned = 0;
    let total = 0;

    const reportProgress = () => {
      if (typeof onProgress === 'function') {
        onProgress({
          scanned,
          total,
          progress: total > 0 ? (scanned / total) * 100 : 0,
          found: [...results],
        });
      }
    };

    // ── Phase 1: Re-check saved connection ──
    if (this.connectedServer) {
      const { ip, port } = this.connectedServer;
      total = 1;
      reportProgress();
      const r = await this.checkServer(ip, port, timeout);
      scanned = 1;
      if (r.success) {
        results.push({ ip, port });
        reportProgress();
        this.isScanning = false;
        return { success: true, servers: results };
      }
      reportProgress();
    }

    // ── Phase 2: mDNS / Zeroconf (runs concurrently with phase 3 setup) ──
    let zeroconfPromise = null;
    if (useZeroconf) {
      zeroconfPromise = this.discoverViaZeroconf(signal, 5000).catch(() => []);
    }

    // ── Phase 3: Build IP scan list ──
    const networkInfo = await this.getNetworkInfo();
    if (!networkInfo.success) {
      this.isScanning = false;
      return {
        success: false,
        reason: networkInfo.reason || 'Could not determine network address',
      };
    }

    const { subnet, gateway } = networkInfo;
    const addresses = this._buildScanList(subnet, gateway, ports);
    total = addresses.length + scanned;
    reportProgress();

    // ── Check Zeroconf results before IP scan ──
    if (zeroconfPromise) {
      const zeroconfResults = await zeroconfPromise;
      if (zeroconfResults.length > 0) {
        for (const srv of zeroconfResults) {
          if (signal.aborted) break;
          const r = await this.checkServer(srv.ip, srv.port, timeout);
          if (r.success && !results.some(s => s.ip === srv.ip && s.port === srv.port)) {
            results.push({ ip: srv.ip, port: srv.port });
            await this.saveConnection(srv.ip, srv.port);
            reportProgress();
            this.isScanning = false;
            return { success: true, servers: results };
          }
        }
      }
    }

    // ── Phase 4: Parallel IP scan ──
    try {
      await this._parallelScan(addresses, results, maxConcurrent, timeout, signal, () => {
        scanned++;
        reportProgress();
      });
    } catch {
      // scan aborted or errored — results may still have entries
    }

    this.isScanning = false;

    if (results.length > 0) {
      await this.saveConnection(results[0].ip, results[0].port);
    }

    reportProgress();

    return {
      success: results.length > 0,
      servers: results,
      scannedAddresses: scanned,
      totalAddresses: total,
      reason: results.length ? null : 'No servers found',
    };
  }

  // ─── Build Scan List ────────────────────────────────────────────

  _buildScanList(subnet, gateway, ports) {
    const seen = new Set();
    const addresses = [];

    const add = (ip, port, priority) => {
      const key = `${ip}:${port}`;
      if (seen.has(key)) return;
      seen.add(key);
      addresses.push({ ip, port, priority });
    };

    // Priority 0: Gateway (most likely for single-board servers like RPi)
    if (gateway && this.isValidIpAddress(gateway)) {
      for (const port of ports) add(gateway, port, 0);
    }

    // Priority 1: Common server IPs on current subnet
    const priorityOctets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50, 100, 150, 200, 250, 254];
    for (const last of priorityOctets) {
      for (const port of ports) add(`${subnet}.${last}`, port, 1);
    }

    // Priority 2: Full current subnet scan (1-254)
    for (let i = 1; i <= 254; i++) {
      for (const port of ports) add(`${subnet}.${i}`, port, 2);
    }

    // Priority 3: Common fallback subnets (only high-probability IPs)
    const fallbackSubnets = [
      '192.168.86',  // Google Wifi / Nest
      '192.168.1',   // Most common
      '192.168.0',   // Common alternative
      '192.168.2',   // Some routers
      '192.168.10',  // Business routers
      '10.0.0',      // Some ISPs
      '10.0.1',      // Apple / some ISPs
    ];
    for (const fb of fallbackSubnets) {
      if (fb === subnet) continue;
      for (const last of priorityOctets) {
        for (const port of ports) add(`${fb}.${last}`, port, 3);
      }
    }

    addresses.sort((a, b) => a.priority - b.priority);
    return addresses;
  }

  // ─── Parallel Scanner ───────────────────────────────────────────

  async _parallelScan(addresses, results, maxConcurrent, timeout, signal, onEach) {
    let idx = 0;

    const worker = async () => {
      while (idx < addresses.length) {
        if (signal.aborted || results.length > 0) return;

        const addr = addresses[idx++];
        if (!addr) return;

        try {
          const r = await this.checkServer(addr.ip, addr.port, timeout);
          if (r.success && !results.some(s => s.ip === addr.ip && s.port === addr.port)) {
            results.push({ ip: addr.ip, port: addr.port });
          }
        } catch {
          // individual check failed, continue
        }
        onEach();
      }
    };

    const workers = [];
    for (let i = 0; i < Math.min(maxConcurrent, addresses.length); i++) {
      workers.push(worker());
    }
    await Promise.allSettled(workers);
  }

  // ─── Zeroconf / mDNS Discovery ─────────────────────────────────

  async discoverViaZeroconf(signal, timeoutMs = 5000) {
    if (Platform.OS === 'android') {
      const ok = await this.ensureLocationPermission();
      if (!ok) {
        console.log('Cannot use Zeroconf without location permission');
        return [];
      }
    }

    if (!Zeroconf) {
      console.log('Zeroconf module not available');
      return [];
    }

    return new Promise(resolve => {
      const results = [];
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        try {
          zeroconf.stop();
        } catch {}
        console.log(`Zeroconf found ${results.length} services`);
        resolve(results);
      };

      let zeroconf;
      try {
        zeroconf = new Zeroconf();
      } catch (error) {
        console.log('Failed to create Zeroconf instance:', error?.message);
        resolve([]);
        return;
      }

      if (signal) {
        signal.addEventListener('abort', finish);
      }

      zeroconf.on('resolved', service => {
        console.log('mDNS resolved:', service.name, service.addresses, service.port);
        const isPictureFrame =
          service.name?.toLowerCase().includes('pictureframe') ||
          service.name?.toLowerCase().includes('picture-frame') ||
          service.name?.toLowerCase().includes('frame') ||
          (service.txt && service.txt.type === 'pictureframe');

        if (isPictureFrame && service.addresses?.length > 0) {
          // Prefer IPv4 addresses
          const ipv4 = service.addresses.find(a => this.isValidIpAddress(a));
          const ip = ipv4 || service.addresses[0];
          if (ip && !results.some(r => r.ip === ip && r.port === service.port)) {
            results.push({ ip, port: service.port, name: service.name });
          }
        }
      });

      zeroconf.on('error', error => {
        console.log('Zeroconf error:', error);
      });

      // Scan for HTTP services
      try {
        zeroconf.scan('_http._tcp.', 'local.');
      } catch (error) {
        console.log('Zeroconf scan error:', error?.message);
      }

      // Time-box the discovery
      setTimeout(finish, timeoutMs);
    });
  }

  // ─── Manual Connect ─────────────────────────────────────────────

  async manualConnect(ip, port = 5000) {
    const result = await this.checkServer(ip, port);
    if (result.success) {
      await this.saveConnection(ip, port);
      return { success: true, ip, port };
    }
    return { success: false, reason: result.reason || 'Not a picture frame server' };
  }
}

export default new NetworkService();
