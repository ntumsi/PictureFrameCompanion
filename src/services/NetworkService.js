// import axios from 'axios';
// import * as SecureStore from 'expo-secure-store';

//   // Key for storing connection info
//   const CONNECTION_KEY = 'pictureframe_connection';

//   class NetworkService {
//     // Store the connection info when found
//     connectedServer = null;

//     constructor() {
//       // Load saved connection when service is initialized
//       this.loadSavedConnection();
//     }

//     // Load saved connection from secure storage
//     async loadSavedConnection() {
//       try {
//         const savedConnection = await SecureStore.getItemAsync(CONNECTION_KEY);
//         if (savedConnection) {
//           this.connectedServer = JSON.parse(savedConnection);
//           console.log('Loaded saved connection:', this.connectedServer);
//         }
//       } catch (error) {
//         console.error('Failed to load saved connection:', error);
//       }
//     }

//     // Check if a specific IP:port has the picture frame server running
//     async checkServer(ip, port = 5000) {
//       try {
//         // Attempt to call the images API endpoint
//         const response = await axios.get(`http://${ip}:${port}/api/images`, {
//           timeout: 3000 // 3 second timeout
//         });

//         // Verify it's the picture frame server by checking response format
//         if (Array.isArray(response.data) && response.headers['x-server']?.includes('PictureFrame')) {
//           this.connectedServer = { ip, port };
//           return { success: true, ip, port };
//         }
//         return { success: false, reason: 'Not a picture frame server' };
//       } catch (error) {
//         console.log(`Error checking ${ip}:${port}:`, error.message);
//         return { success: false, reason: error.message };
//       }
//     }

    
//      async scanNetwork() {
//     const results = [];
//     const baseIp = await this.getBaseIp();

//     if (!baseIp) return { success: false, reason: 'Could not determine network address' };

//     // Extract first two octets (e.g., "192.168")
//     const subnet = baseIp.split('.').slice(0, 2).join('.');

//     // Check common ports
//     const ports = [5000, 3000];

//     // For comprehensive scanning, we'll use a more targeted approach to avoid timeout issues
//     // We'll scan a subset of possible IPs to keep it manageable

//     // Define ranges to scan for third and fourth octets
//     const thirdOctetRange = [0, 1, 2, 10, 100, 168, 192, 254]; // Common third octets
//     const fourthOctetRange = [1, 2, 3, 4, 5, 10, 20, 50, 100, 150, 200, 250, 254]; // Common fourth octets

//     // For more comprehensive scan, uncomment the following
//     // Scanning all possible combinations would be too time-consuming and battery-intensive
//     // const thirdOctetRange = Array.from({ length: 256 }, (_, i) => i); // All possibilities 0-255
//     // const fourthOctetRange = Array.from({ length: 256 }, (_, i) => i); // All possibilities 0-255

//     // First try scanning the current subnet completely (based on baseIp)
//     const currentThirdOctet = parseInt(baseIp.split('.')[2] || '1');
//     const fullScanPromises = [];

//     // Scan all IPs in the current third octet
//     for (let i = 1; i < 255; i++) {
//       for (const port of ports) {
//         const ip = `${subnet}.${currentThirdOctet}.${i}`;
//         fullScanPromises.push(this.checkServer(ip, port).then(result => {
//           if (result.success) {
//             results.push({ ip, port });
//           }
//           return result;
//         }));

//         // Check 10 IPs at once to avoid overwhelming the network
//         if (fullScanPromises.length >= 10) {
//           await Promise.all(fullScanPromises);
//           fullScanPromises.length = 0;

//           // If we've found servers, return early
//           if (results.length > 0) {
//             return {
//               success: true,
//               servers: results,
//             };
//           }
//         }
//       }
//     }

//     // Wait for any remaining checks in the main subnet
//     if (fullScanPromises.length > 0) {
//       await Promise.all(fullScanPromises);
//       fullScanPromises.length = 0;
//     }

//     // If we found servers in the current subnet, return them
//     if (results.length > 0) {
//       return {
//         success: true,
//         servers: results,
//       };
//     }

//     // If nothing found in the current subnet, try common subnets
//     const promises = [];
//     for (const thirdOctet of thirdOctetRange) {
//       for (const fourthOctet of fourthOctetRange) {
//         for (const port of ports) {
//           const ip = `${subnet}.${thirdOctet}.${fourthOctet}`;
//           promises.push(this.checkServer(ip, port).then(result => {
//             if (result.success) {
//               results.push({ ip, port });
//             }
//             return result;
//           }));

//           // Check 10 IPs at once to avoid overwhelming the network
//           if (promises.length >= 10) {
//             await Promise.all(promises);
//             promises.length = 0;

//             // If we've found servers, return early
//             if (results.length > 0) {
//               return {
//                 success: true,
//                 servers: results,
//               };
//             }
//           }
//         }
//       }
//     }

//     // Wait for any remaining checks
//     if (promises.length > 0) {
//       await Promise.all(promises);
//     }

//     return {
//       success: results.length > 0,
//       servers: results,
//       reason: results.length ? null : 'No servers found'
//     };
//   }

//     // Get the device's current IP to determine network segment
//     async getBaseIp() {
//       try {
//         // This is a simple approach - in a real app, you'd use a native module
//         const response = await axios.get('https://api.ipify.org/?format=json');
//         // Note: This gives external IP, which isn't useful for local scanning
//         // In a real app, you'd use Network Info API or a native module

//         // For demo purposes, return a default home network
//         return '192.168.1.1'; // This should be dynamically determined in a real app
//       } catch (error) {
//         console.error('Error getting IP:', error);
//         return null;
//       }
//     }

//     // Get base URL for API calls once we know the server address
//     getApiBaseUrl() {
//       if (!this.connectedServer) return null;
//       const { ip, port } = this.connectedServer;
//       return `http://${ip}:${port}/api`;
//     }

//     // Save connection details
//     async saveConnection(ip, port) {
//       this.connectedServer = { ip, port };

//       try {
//         // Save to secure storage
//         await SecureStore.setItemAsync(
//           CONNECTION_KEY,
//           JSON.stringify(this.connectedServer)
//         );
//         console.log('Connection saved:', this.connectedServer);
//         return true;
//       } catch (error) {
//         console.error('Failed to save connection:', error);
//         return false;
//       }
//     }

//     // Clear saved connection
//     async clearConnection() {
//       this.connectedServer = null;

//       try {
//         await SecureStore.deleteItemAsync(CONNECTION_KEY);
//         console.log('Connection cleared');
//         return true;
//       } catch (error) {
//         console.error('Failed to clear connection:', error);
//         return false;
//       }
//     }
//   }

//   export default new NetworkService();
import axios from 'axios';
  import * as SecureStore from 'expo-secure-store';

  // Key for storing connection info
  const CONNECTION_KEY = 'pictureframe_connection';

  class NetworkService {
    // Store the connection info when found
    connectedServer = null;

    constructor() {
      // Load saved connection when service is initialized
      this.loadSavedConnection();
    }

    // Load saved connection from secure storage
    async loadSavedConnection() {
      try {
        const savedConnection = await SecureStore.getItemAsync(CONNECTION_KEY);
        if (savedConnection) {
          this.connectedServer = JSON.parse(savedConnection);
          console.log('Loaded saved connection:', this.connectedServer);
        }
      } catch (error) {
        console.error('Failed to load saved connection:', error);
      }
    }

    // Check if a specific IP:port has the picture frame server running
    async checkServer(ip, port = 5000) {
      try {
        console.log(`Checking server at ${ip}:${port}`);
        // Attempt to call the images API endpoint
        const response = await axios.get(`http://${ip}:${port}/api/images`, {
          timeout: 3000, // 3 second timeout
          headers: {
            'Cache-Control': 'no-cache', // Prevent caching
            'Pragma': 'no-cache'
          }
        });

        // Verify it's the picture frame server by checking response format
        console.log(`Got response from ${ip}:${port}, data type: ${typeof response.data}, is
   array: ${Array.isArray(response.data)}`);

        // Check if we got an array (which is what the picture frame returns)
        if (Array.isArray(response.data)) {
          console.log(`Success! Found server at ${ip}:${port}`);
          this.connectedServer = { ip, port };
          return { success: true, ip, port };
        }

        console.log(`Server at ${ip}:${port} didn't return expected array data`);
        return { success: false, reason: 'Not a picture frame server' };
      } catch (error) {
        // Log brief error without overwhelming console
        console.log(`Error checking ${ip}:${port}:`, error.message);
        return { success: false, reason: error.message };
      }
    }

    // Enhanced scan network function
    async scanNetwork() {
      console.log('Starting network scan...');
      const results = [];
      const baseIp = await this.getBaseIp();
      console.log('Base IP for scanning:', baseIp);

      if (!baseIp) return { success: false, reason: 'Could not determine network address' };

      // Extract first two octets (e.g., "192.168")
      const subnet = baseIp.split('.').slice(0, 2).join('.');
      console.log('Using subnet for scan:', subnet);

      // Common ports for PictureFrame server
      const ports = [5000, 3000];

      // Current third octet (from base IP if available)
      const ipParts = baseIp.split('.');

      // Try to scan our current subnet first for better efficiency
      if (ipParts.length >= 3) {
        const currentThirdOctet = parseInt(ipParts[2]);
        console.log(`Scanning current subnet ${subnet}.${currentThirdOctet}.*`);

        // Try the current network's gateway first (usually .1)
        try {
          const gatewayIp = `${subnet}.${currentThirdOctet}.1`;
          console.log(`Checking gateway at ${gatewayIp}`);

          for (const port of ports) {
            const result = await this.checkServer(gatewayIp, port);
            if (result.success) {
              console.log(`SUCCESS: Found server at gateway ${gatewayIp}:${port}`);
              results.push({ ip: gatewayIp, port });
              return { success: true, servers: results };
            }
          }
        } catch (error) {
          console.log('Error checking gateway:', error.message);
        }

        // Now scan the rest of our subnet
        const currentSubnetResults = await this.scanSubnet(subnet, currentThirdOctet,
  ports);
        if (currentSubnetResults.length > 0) {
          console.log(`Found ${currentSubnetResults.length} servers in current subnet`);
          results.push(...currentSubnetResults);
          return { success: true, servers: results };
        }
      }

      // If our current subnet didn't work, try scanning common third octets
      console.log('Current subnet scan completed with no results, trying commonsubnets...');

      // Scan third octets 1-100 looking for the server
      for (let thirdOctet = 1; thirdOctet <= 100; thirdOctet++) {
        // Skip our current subnet which we already checked
        if (ipParts.length >= 3 && thirdOctet === parseInt(ipParts[2])) {
          continue;
        }

        console.log(`Scanning subnet ${subnet}.${thirdOctet}.*`);

        // Try just the .1 address first (router/gateway)
        try {
          const gatewayIp = `${subnet}.${thirdOctet}.1`;

          for (const port of ports) {
            const result = await this.checkServer(gatewayIp, port);
            if (result.success) {
              console.log(`SUCCESS: Found server at ${gatewayIp}:${port}`);
              results.push({ ip: gatewayIp, port });
              return { success: true, servers: results };
            }
          }
        } catch (_error) {
          // Continue to next subnet
        }

        // Try some common addresses in this subnet
        const commonFourthOctets = [2, 5, 10, 20, 50, 100, 150, 200, 250, 254];
        for (const fourthOctet of commonFourthOctets) {
          try {
            const ip = `${subnet}.${thirdOctet}.${fourthOctet}`;

            for (const port of ports) {
              const result = await this.checkServer(ip, port);
              if (result.success) {
                console.log(`SUCCESS: Found server at ${ip}:${port}`);
                results.push({ ip, port });
                return { success: true, servers: results };
              }
            }
          } catch (_error) {
            // Continue to next address
          }
        }
      }

      console.log(`Scan complete. Found ${results.length} servers.`);
      return {
        success: results.length > 0,
        servers: results,
        reason: results.length ? null : 'No servers found'
      };
    }

    // Helper to scan a specific subnet
    async scanSubnet(subnet, thirdOctet, ports) {
      const results = [];
      const commonFourthOctets = [1, 2, 5, 10, 20, 50, 100, 150, 200, 250, 254];

      // Try common fourth octets first for speed
      for (const fourthOctet of commonFourthOctets) {
        const ip = `${subnet}.${thirdOctet}.${fourthOctet}`;

        for (const port of ports) {
          try {
            const result = await this.checkServer(ip, port);
            if (result.success) {
              console.log(`SUCCESS: Found server at ${ip}:${port}`);
              results.push({ ip, port });
              return results; // Return early for better UX
            }
          } catch (_error) {
            // Continue to next address
          }
        }
      }

      // If we didn't find anything in common addresses, do a more targeted scan
      // This is a compromise between speed and thoroughness
      for (let i = 2; i <= 20; i++) {
        // Skip the common ones we already checked
        if (commonFourthOctets.includes(i)) continue;

        const ip = `${subnet}.${thirdOctet}.${i}`;

        for (const port of ports) {
          try {
            const result = await this.checkServer(ip, port);
            if (result.success) {
              console.log(`SUCCESS: Found server at ${ip}:${port}`);
              results.push({ ip, port });
              return results; // Return early
            }
          } catch (_error) {
            // Continue to next address
          }
        }
      }

      return results;
    }

    // Get the device's current IP to determine network segment
    async getBaseIp() {
      try {
        console.log('Getting base IP for scanning...');

        // Try to get network info dynamically if possible
        try {
          // Dynamic import for NetInfo to avoid requiring the dependency
          const NetInfo = await import('@react-native-community/netinfo').catch(() => null);
          if (NetInfo) {
            const netInfo = await NetInfo.default.fetch();
            console.log('Network info:', JSON.stringify(netInfo, null, 2));

            if (netInfo.type === 'wifi' && netInfo.details && netInfo.details.ipAddress) {
              console.log('Found device IP:', netInfo.details.ipAddress);
              return netInfo.details.ipAddress;
            }
          }
        } catch (netInfoError) {
          console.log('Error getting network info:', netInfoError.message);
        }

        // Fallback to common networks
        console.log('Using default IP for scanning base: 192.168.1.1');
        return '192.168.1.1';
      } catch (error) {
        console.error('Error getting IP:', error);
        return null;
      }
    }

    // Get base URL for API calls once we know the server address
    getApiBaseUrl() {
      if (!this.connectedServer) return null;
      const { ip, port } = this.connectedServer;
      return `http://${ip}:${port}/api`;
    }

    // Save connection details
    async saveConnection(ip, port) {
      this.connectedServer = { ip, port };

      try {
        // Save to secure storage
        await SecureStore.setItemAsync(
          CONNECTION_KEY,
          JSON.stringify(this.connectedServer)
        );
        console.log('Connection saved:', this.connectedServer);
        return true;
      } catch (error) {
        console.error('Failed to save connection:', error);
        return false;
      }
    }

    // Clear saved connection
    async clearConnection() {
      this.connectedServer = null;

      try {
        await SecureStore.deleteItemAsync(CONNECTION_KEY);
        console.log('Connection cleared');
        return true;
      } catch (error) {
        console.error('Failed to clear connection:', error);
        return false;
      }
    }

    // Add a network status check method for diagnostics
    async checkNetworkStatus() {
      try {
        const status = {
          isConnected: false,
          isWifi: false,
          ipAddress: null,
          wifiName: null,
          internetAccess: false
        };

        // Check basic connectivity
        try {
          // Dynamic import to avoid requiring the dependency
          const NetInfo = await import('@react-native-community/netinfo').catch(() => null);
          if (NetInfo) {
            const netInfo = await NetInfo.default.fetch();

            status.isConnected = netInfo.isConnected;
            status.isWifi = netInfo.type === 'wifi';
            status.ipAddress = netInfo.details?.ipAddress;
            status.wifiName = netInfo.details?.ssid;

            console.log('Network status:', netInfo);
          }
        } catch (e) {
          console.log('Error checking network status:', e);
        }

        // Check internet access
        try {
          await fetch('https://www.google.com', {
            method: 'HEAD',
            timeout: 5000
          });
          status.internetAccess = true;
        } catch (_e) {
          status.internetAccess = false;
        }

        return status;
      } catch (error) {
        console.error('Error in network status check:', error);
        return null;
      }
    }
  }

  export default new NetworkService();