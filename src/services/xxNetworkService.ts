import axios, { isAxiosError } from 'axios';

  interface ServerInfo {
    ip: string;
    port: number;
  }

  interface ServerCheckResult {
    success: boolean;
    reason?: string;
    ip?: string;
    port?: number;
  }

  interface NetworkScanResult {
    success: boolean;
    servers?: ServerInfo[];
    reason?: string;
  }

  class NetworkService {
    // Store the connection info when found
    connectedServer: ServerInfo | null = null;

    // Check if a specific IP:port has the picture frame server running
    async checkServer(ip: string, port: number = 5000): Promise<ServerCheckResult> {
      console.log(`Checking server at ${ip}:${port}`);
      try {
        // Add a timeout to the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await axios.get(`http://${ip}:${port}/api/images`, {
          timeout: 3000,
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }).catch((error: unknown) => {
          if (isAxiosError(error)) {
            console.log(`Error response from ${ip}:${port}:`, error.message);
          } else {
            console.log(`Unknown error checking ${ip}:${port}`);
          }
          throw error;
        });

        clearTimeout(timeoutId);

        console.log(`Server response from ${ip}:${port}:`,
          Array.isArray(response.data) ? `Array with ${response.data.length} items` : typeof
   response.data);
        console.log('Headers:', JSON.stringify(response.headers));

        // Verify it's the picture frame server by checking response format
        if (Array.isArray(response.data)) {
          console.log(`Success: Found server at ${ip}:${port}`);
          this.connectedServer = { ip, port };
          return { success: true, ip, port };
        }

        console.log(`Server at ${ip}:${port} returned unexpected data format`);
        return { success: false, reason: 'Not a picture frame server' };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Error checking ${ip}:${port}:`, errorMessage);
        return { success: false, reason: errorMessage };
      }
    }

    // Scan common subnet for the server - the original method
    async scanNetwork(): Promise<NetworkScanResult> {
      const results: ServerInfo[] = [];
      const baseIp = await this.getBaseIp();

      if (!baseIp) return { success: false, reason: 'Could not determine network address' };

      // Extract first three octets (e.g., "192.168.1")
      const subnet = baseIp.split('.').slice(0, 3).join('.');

      // Check common ports
      const ports = [5000, 3000];

      // Scan last octet range
      const promises: Promise<ServerCheckResult>[] = [];
      for (let i = 1; i < 20; i++) { // Reduced range to improve speed
        for (const port of ports) {
          const ip = `${subnet}.${i}`;
          promises.push(this.checkServer(ip, port).then(result => {
            if (result.success) {
              results.push({ ip, port });
            }
            return result;
          }));

          // Check 10 IPs at once to avoid overwhelming the network
          if (promises.length >= 10) {
            await Promise.all(promises);
            promises.length = 0;

            // If we found servers, return early for better UX
            if (results.length > 0) {
              return { success: true, servers: results };
            }
          }
        }
      }

      // Wait for any remaining checks
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      return {
        success: results.length > 0,
        servers: results,
        reason: results.length ? undefined : 'No servers found'
      };
    }

    // Enhanced scanning method for production app
    async scanCommonIPs(): Promise<NetworkScanResult> {
      console.log('Starting scan of common IP addresses...');
      const results: ServerInfo[] = [];

      // Define common IP patterns for home networks
      const commonPatterns = [
        { subnet: '192.168.1', range: [1, 20] },
        { subnet: '192.168.0', range: [1, 20] },
        { subnet: '10.0.0', range: [1, 20] },
        { subnet: '10.0.1', range: [1, 20] },
        { subnet: '172.16.0', range: [1, 20] }
      ];

      // Common ports for PictureFrame
      const ports = [5000, 3000];

      // Check if we're on a specific known network
      try {
        // Try to get more network info - this will be a dynamic import
        try {
          const NetInfo = await import('@react-native-community/netinfo');
          const netInfo = await NetInfo.default.fetch();
          console.log('Current network info:', JSON.stringify(netInfo));

          if (netInfo.type === 'wifi' && netInfo.details && netInfo.details.ipAddress) {
            // Extract subnet from device IP
            const deviceIP = netInfo.details.ipAddress;
            console.log('Device IP:', deviceIP);

            const subnet = deviceIP.split('.').slice(0, 3).join('.');
            console.log('Current subnet:', subnet);

            // Add the current subnet as the first to check
            commonPatterns.unshift({ subnet, range: [1, 20] });
          }
        } catch (netInfoError: unknown) {
          // NetInfo may not be available, continue with standard patterns
          console.error('Error getting network info:',
            netInfoError instanceof Error ? netInfoError.message : 'Unknown error');
        }

        // Try each subnet and port combination
        for (const pattern of commonPatterns) {
          for (let i = pattern.range[0]; i <= pattern.range[1]; i++) {
            const ip = `${pattern.subnet}.${i}`;
            console.log(`Checking ${ip}...`);

            for (const port of ports) {
              try {
                const result = await this.checkServer(ip, port);
                if (result.success) {
                  console.log(`SUCCESS: Found server at ${ip}:${port}`);
                  results.push({ ip, port });
                  // Return early for better UX
                  return {
                    success: true,
                    servers: results
                  };
                }
              } catch {
                // Continue to next target
              }
            }
          }
        }
      } catch (error: unknown) {
        console.error('Error during network scan:',
          error instanceof Error ? error.message : 'Unknown error');
        return {
          success: false,
          reason: `Scan error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      console.log(`Scan complete. Found ${results.length} servers.`);
      return {
        success: results.length > 0,
        servers: results,
        reason: results.length ? undefined : 'No servers found'
      };
    }

    // Get the device's current IP to determine network segment
    async getBaseIp(): Promise<string | null> {
      try {
        console.log('Getting device IP address...');

        // Try to get more network info
        try {
          const NetInfo = await import('@react-native-community/netinfo');
          const netInfo = await NetInfo.default.fetch();

          if (netInfo.type === 'wifi' && netInfo.details && netInfo.details.ipAddress) {
            const ipAddress = netInfo.details.ipAddress;
            console.log('Device IP from NetInfo:', ipAddress);
            return ipAddress;
          }
        } catch (netInfoError: unknown) {
          console.log('Error getting NetInfo:',
            netInfoError instanceof Error ? netInfoError.message : 'Unknown error');
        }

        // Fallback to default subnet
        console.log('Using default IP: 192.168.1.1');
        return '192.168.1.1';
      } catch (error: unknown) {
        console.error('Error getting IP:',
          error instanceof Error ? error.message : 'Unknown error');
        return null;
      }
    }

    // Get base URL for API calls once we know the server address
    getApiBaseUrl(): string | null {
      if (!this.connectedServer) return null;
      const { ip, port } = this.connectedServer;
      return `http://${ip}:${port}/api`;
    }

    // Save connection details with persistence
    async saveConnection(ip: string, port: number): Promise<boolean> {
      this.connectedServer = { ip, port };

      try {
        // If we have AsyncStorage, save the connection
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.default.setItem(
            'PICTUREFRAME_CONNECTION',
            JSON.stringify({ ip, port })
          );
          console.log('Saved connection to storage:', { ip, port });
        } catch (storageError: unknown) {
          console.log('Could not save to AsyncStorage:',
            storageError instanceof Error ? storageError.message : 'Unknown error');
        }

        return true;
      } catch (error: unknown) {
        console.error('Error saving connection:',
          error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    }

    // Clear the saved connection
    async clearConnection(): Promise<boolean> {
      this.connectedServer = null;

      try {
        // If we have AsyncStorage, clear the saved connection
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.default.removeItem('PICTUREFRAME_CONNECTION');
          console.log('Cleared saved connection');
        } catch (storageError: unknown) {
          console.log('Could not access AsyncStorage:',
            storageError instanceof Error ? storageError.message : 'Unknown error');
        }

        return true;
      } catch (error: unknown) {
        console.error('Error clearing connection:',
          error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    }

    // Load saved connection on initialization
    async loadSavedConnection(): Promise<boolean> {
      try {
        // If we have AsyncStorage, try to load saved connection
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          const savedConnection = await
  AsyncStorage.default.getItem('PICTUREFRAME_CONNECTION');

          if (savedConnection) {
            const connection = JSON.parse(savedConnection) as ServerInfo;
            this.connectedServer = connection;
            console.log('Loaded saved connection:', connection);
            return true;
          }
        } catch (storageError: unknown) {
          console.log('Could not load from AsyncStorage:',
            storageError instanceof Error ? storageError.message : 'Unknown error');
        }

        return false;
      } catch (error: unknown) {
        console.error('Error loading connection:',
          error instanceof Error ? error.message : 'Unknown error');
        return false;
      }
    }

    // Check network status
    async checkNetworkStatus(): Promise<{
      isConnected: boolean;
      isWifi: boolean;
      ipAddress: string | null;
      wifiName: string | null;
      internetAccess: boolean;
    } | null> {
      try {
        const status = {
          isConnected: false,
          isWifi: false,
          ipAddress: null as string | null,
          wifiName: null as string | null,
          internetAccess: false
        };

        // Check basic connectivity
        try {
          const NetInfo = await import('@react-native-community/netinfo');
          const netInfo = await NetInfo.default.fetch();

          status.isConnected = !!netInfo.isConnected;
          status.isWifi = netInfo.type === 'wifi';
          status.ipAddress = (netInfo.details && 'ipAddress' in netInfo.details)
            ? (netInfo.details as { ipAddress?: string }).ipAddress || null
            : null;
          status.wifiName = (netInfo.type === 'wifi' && netInfo.details && 'ssid' in netInfo.details)
            ? (netInfo.details as { ssid?: string }).ssid || null
            : null;

          console.log('Network status:', netInfo);
        } catch {
          console.log('Error checking network status:',
            'Unknown error');
        }

        // Check internet access
        try {
          await fetch('https://www.google.com', {
            method: 'HEAD',
            headers: { 'Cache-Control': 'no-cache' }
          });
          status.internetAccess = true;
        } catch {
          status.internetAccess = false;
        }

        return status;
      } catch (error: unknown) {
        console.error('Error in network status check:',
          error instanceof Error ? error.message : 'Unknown error');
        return null;
      }
    }
  }

  export default new NetworkService();

  