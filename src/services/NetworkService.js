
// //   export default new NetworkService();
// import axios from 'axios';
//   import * as SecureStore from 'expo-secure-store';

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
//         console.log(`Checking server at ${ip}:${port}`);
//         // Attempt to call the images API endpoint
//         const response = await axios.get(`http://${ip}:${port}/api/images`, {
//           timeout: 3000, // 3 second timeout
//           headers: {
//             'Cache-Control': 'no-cache', // Prevent caching
//             'Pragma': 'no-cache'
//           }
//         });

//         // Verify it's the picture frame server by checking response format
//         console.log(`Got response from ${ip}:${port}, data type: ${typeof response.data}, is
//    array: ${Array.isArray(response.data)}`);

//         // Check if we got an array (which is what the picture frame returns)
//         if (Array.isArray(response.data)) {
//           console.log(`Success! Found server at ${ip}:${port}`);
//           this.connectedServer = { ip, port };
//           return { success: true, ip, port };
//         }

//         console.log(`Server at ${ip}:${port} didn't return expected array data`);
//         return { success: false, reason: 'Not a picture frame server' };
//       } catch (error) {
//         // Log brief error without overwhelming console
//         console.log(`Error checking ${ip}:${port}:`, error.message);
//         return { success: false, reason: error.message };
//       }
//     }

//     // Enhanced scan network function
//     async scanNetwork() {
//       console.log('Starting network scan...');
//       const results = [];
//       const baseIp = await this.getBaseIp();
//       console.log('Base IP for scanning:', baseIp);

//       if (!baseIp) return { success: false, reason: 'Could not determine network address' };

//       // Extract first two octets (e.g., "192.168")
//       const subnet = baseIp.split('.').slice(0, 2).join('.');
//       console.log('Using subnet for scan:', subnet);

//       // Common ports for PictureFrame server
//       const ports = [5000, 3000];

//       // Current third octet (from base IP if available)
//       const ipParts = baseIp.split('.');

//       // Try to scan our current subnet first for better efficiency
//       if (ipParts.length >= 3) {
//         const currentThirdOctet = parseInt(ipParts[2]);
//         console.log(`Scanning current subnet ${subnet}.${currentThirdOctet}.*`);

//         // Try the current network's gateway first (usually .1)
//         try {
//           const gatewayIp = `${subnet}.${currentThirdOctet}.1`;
//           console.log(`Checking gateway at ${gatewayIp}`);

//           for (const port of ports) {
//             const result = await this.checkServer(gatewayIp, port);
//             if (result.success) {
//               console.log(`SUCCESS: Found server at gateway ${gatewayIp}:${port}`);
//               results.push({ ip: gatewayIp, port });
//               return { success: true, servers: results };
//             }
//           }
//         } catch (error) {
//           console.log('Error checking gateway:', error.message);
//         }

//         // Now scan the rest of our subnet
//         const currentSubnetResults = await this.scanSubnet(subnet, currentThirdOctet,
//   ports);
//         if (currentSubnetResults.length > 0) {
//           console.log(`Found ${currentSubnetResults.length} servers in current subnet`);
//           results.push(...currentSubnetResults);
//           return { success: true, servers: results };
//         }
//       }

//       // If our current subnet didn't work, try scanning common third octets
//       console.log('Current subnet scan completed with no results, trying commonsubnets...');

//       // Scan third octets 1-100 looking for the server
//       for (let thirdOctet = 1; thirdOctet <= 100; thirdOctet++) {
//         // Skip our current subnet which we already checked
//         if (ipParts.length >= 3 && thirdOctet === parseInt(ipParts[2])) {
//           continue;
//         }

//         console.log(`Scanning subnet ${subnet}.${thirdOctet}.*`);

//         // Try just the .1 address first (router/gateway)
//         try {
//           const gatewayIp = `${subnet}.${thirdOctet}.1`;

//           for (const port of ports) {
//             const result = await this.checkServer(gatewayIp, port);
//             if (result.success) {
//               console.log(`SUCCESS: Found server at ${gatewayIp}:${port}`);
//               results.push({ ip: gatewayIp, port });
//               return { success: true, servers: results };
//             }
//           }
//         } catch (_error) {
//           // Continue to next subnet
//         }

//         // Try some common addresses in this subnet
//         const commonFourthOctets = [2, 5, 10, 20, 50, 100, 150, 200, 250, 254];
//         for (const fourthOctet of commonFourthOctets) {
//           try {
//             const ip = `${subnet}.${thirdOctet}.${fourthOctet}`;

//             for (const port of ports) {
//               const result = await this.checkServer(ip, port);
//               if (result.success) {
//                 console.log(`SUCCESS: Found server at ${ip}:${port}`);
//                 results.push({ ip, port });
//                 return { success: true, servers: results };
//               }
//             }
//           } catch (_error) {
//             // Continue to next address
//           }
//         }
//       }

//       console.log(`Scan complete. Found ${results.length} servers.`);
//       return {
//         success: results.length > 0,
//         servers: results,
//         reason: results.length ? null : 'No servers found'
//       };
//     }

//     // Helper to scan a specific subnet
//     async scanSubnet(subnet, thirdOctet, ports) {
//       const results = [];
//       const commonFourthOctets = [1, 2, 5, 10, 20, 50, 100, 150, 200, 250, 254];

//       // Try common fourth octets first for speed
//       for (const fourthOctet of commonFourthOctets) {
//         const ip = `${subnet}.${thirdOctet}.${fourthOctet}`;

//         for (const port of ports) {
//           try {
//             const result = await this.checkServer(ip, port);
//             if (result.success) {
//               console.log(`SUCCESS: Found server at ${ip}:${port}`);
//               results.push({ ip, port });
//               return results; // Return early for better UX
//             }
//           } catch (_error) {
//             // Continue to next address
//           }
//         }
//       }

//       // If we didn't find anything in common addresses, do a more targeted scan
//       // This is a compromise between speed and thoroughness
//       for (let i = 2; i <= 20; i++) {
//         // Skip the common ones we already checked
//         if (commonFourthOctets.includes(i)) continue;

//         const ip = `${subnet}.${thirdOctet}.${i}`;

//         for (const port of ports) {
//           try {
//             const result = await this.checkServer(ip, port);
//             if (result.success) {
//               console.log(`SUCCESS: Found server at ${ip}:${port}`);
//               results.push({ ip, port });
//               return results; // Return early
//             }
//           } catch (_error) {
//             // Continue to next address
//           }
//         }
//       }

//       return results;
//     }

//     // Get the device's current IP to determine network segment
//     async getBaseIp() {
//       try {
//         console.log('Getting base IP for scanning...');

//         // Try to get network info dynamically if possible
//         try {
//           // Dynamic import for NetInfo to avoid requiring the dependency
//           const NetInfo = await import('@react-native-community/netinfo').catch(() => null);
//           if (NetInfo) {
//             const netInfo = await NetInfo.default.fetch();
//             console.log('Network info:', JSON.stringify(netInfo, null, 2));

//             if (netInfo.type === 'wifi' && netInfo.details && netInfo.details.ipAddress) {
//               console.log('Found device IP:', netInfo.details.ipAddress);
//               return netInfo.details.ipAddress;
//             }
//           }
//         } catch (netInfoError) {
//           console.log('Error getting network info:', netInfoError.message);
//         }

//         // Fallback to common networks
//         console.log('Using default IP for scanning base: 192.168.1.1');
//         return '192.168.1.1';
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

//     // Add a network status check method for diagnostics
//     async checkNetworkStatus() {
//       try {
//         const status = {
//           isConnected: false,
//           isWifi: false,
//           ipAddress: null,
//           wifiName: null,
//           internetAccess: false
//         };

//         // Check basic connectivity
//         try {
//           // Dynamic import to avoid requiring the dependency
//           const NetInfo = await import('@react-native-community/netinfo').catch(() => null);
//           if (NetInfo) {
//             const netInfo = await NetInfo.default.fetch();

//             status.isConnected = netInfo.isConnected;
//             status.isWifi = netInfo.type === 'wifi';
//             status.ipAddress = netInfo.details?.ipAddress;
//             status.wifiName = netInfo.details?.ssid;

//             console.log('Network status:', netInfo);
//           }
//         } catch (e) {
//           console.log('Error checking network status:', e);
//         }

//         // Check internet access
//         try {
//           await fetch('https://www.google.com', {
//             method: 'HEAD',
//             timeout: 5000
//           });
//           status.internetAccess = true;
//         } catch (_e) {
//           status.internetAccess = false;
//         }

//         return status;
//       } catch (error) {
//         console.error('Error in network status check:', error);
//         return null;
//       }
//     }
//   }

//   export default new NetworkService();
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import Zeroconf from 'react-native-zeroconf';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Key for storing connection info
const CONNECTION_KEY = 'pictureframe_connection';

class NetworkService {
  // Store the connection info when found
  connectedServer = null;
  // Keep track of scanning status
  isScanning = false;
  // For aborting scans
  scanAbortController = null;

  constructor() {
    // Load saved connection when service is initialized
    this.loadSavedConnection();
    
    // Log the construction
    console.log('NetworkService initialized - constructor called');
  }

  // Load saved connection from secure storage
  async loadSavedConnection() {
    try {
      console.log('Loading saved connection from SecureStore');
      const savedConnection = await SecureStore.getItemAsync(CONNECTION_KEY);
      
      if (savedConnection) {
        try {
          this.connectedServer = JSON.parse(savedConnection);
          console.log('Loaded saved connection:', this.connectedServer);
          
          // Verify the connection still works
          if (this.connectedServer && this.connectedServer.ip && this.connectedServer.port) {
            console.log('Verifying saved connection still works...');
            // Don't wait for verification - do it in background
            this.verifyConnection(this.connectedServer.ip, this.connectedServer.port)
              .then(isValid => {
                if (!isValid) {
                  console.log('Saved connection is no longer valid');
                  // Don't clear connection here, as it might be temporary - 
                  // just log the issue
                }
              })
              .catch(err => {
                console.log('Error verifying connection:', err);
              });
          }
        } catch (parseError) {
          console.error('Error parsing saved connection:', parseError);
          // Clear invalid saved connection
          await SecureStore.deleteItemAsync(CONNECTION_KEY);
          this.connectedServer = null;
        }
      } else {
        console.log('No saved connection found');
        this.connectedServer = null;
      }
    } catch (error) {
      console.error('Failed to load saved connection:', 
        error instanceof Error ? error.message : 'Unknown error');
      this.connectedServer = null;
    }
  }
  
  // Verify a connection is still valid
  async verifyConnection(ip, port) {
    try {
      const result = await this.checkServer(ip, port, 5000);
      return result.success;
    } catch (error) {
      console.log('Error verifying connection:', 
        error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // Check if a specific IP:port has the picture frame server running
  async checkServer(ip, port = 5000, timeout = 3000) {
    try {
      // Validate IP address format
      if (!this.isValidIpAddress(ip)) {
        console.error(`Invalid IP address format: ${ip}`);
        return { success: false, reason: 'Invalid IP address format' };
      }
      
      console.log(`Checking server at ${ip}:${port}`);
      // Attempt to call the images API endpoint
      const response = await axios.get(`http://${ip}:${port}/api/images`, {
        timeout: timeout, // Configurable timeout
        headers: {
          'Cache-Control': 'no-cache', // Prevent caching
          'Pragma': 'no-cache'
        }
      });

      // Verify it's the picture frame server by checking response format
      console.log(`Got response from ${ip}:${port}, data type: ${typeof response.data}, is array: ${Array.isArray(response.data)}`);

      // Check if we got an array (which is what the picture frame returns)
      if (Array.isArray(response.data)) {
        console.log(`Success! Found server at ${ip}:${port}`);
        this.connectedServer = { ip, port };
        return { success: true, ip, port };
      }

      console.log(`Server at ${ip}:${port} didn't return expected array data`);
      return { 
        success: false, 
        reason: 'Not a picture frame server',
        responseType: typeof response.data 
      };
    } catch (error) {
      // More detailed error handling
      let reason = 'Unknown error';
      
      if (error.code === 'ECONNABORTED') {
        reason = 'Connection timeout';
      } else if (error.code === 'ECONNREFUSED') {
        reason = 'Connection refused';
      } else if (error.response) {
        reason = `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else if (error.message) {
        reason = error.message;
      }
      
      console.log(`Error checking ${ip}:${port}:`, reason);
      return { success: false, reason, code: error.code };
    }
  }
  
  // Helper to validate IP address format
  isValidIpAddress(ip) {
    if (!ip) return false;
    // Make sure it's a string
    if (typeof ip !== 'string') return false;
    
    // Check format using regex
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipPattern);
    
    if (!match) return false;
    
    // Check each octet is between 0-255
    for (let i = 1; i <= 4; i++) {
      const octet = parseInt(match[i]);
      if (octet < 0 || octet > 255) return false;
    }
    
    return true;
  }

  // Abort any ongoing scan
  abortScan() {
    if (this.isScanning && this.scanAbortController) {
      this.scanAbortController.abort();
      this.isScanning = false;
      console.log('Scan aborted');
    }
  }

  // Enhanced scan network function with parallel processing
  async scanNetwork(options = {}) {
    // If a scan is already in progress, abort it
    if (this.isScanning) {
      this.abortScan();
    }

    const {
      maxConcurrent = 20,        // Maximum concurrent requests
      timeout = 3000,            // Timeout per request in ms
      scanFullSubnet = false,    // Whether to scan full subnet or just common IPs
      maxThirdOctet = 10,        // Maximum third octet to scan (limited to improve speed)
      useZeroconf = true,        // Whether to use mDNS/Bonjour discovery
      onProgress = null,         // Callback for scan progress updates
      scanCurrentNetworkOnly = true, // Only scan the network we're connected to
      skipPermissionCheck = false,   // Skip permission check (not recommended)
    } = options;
    
    console.log('Starting network scan with options:', options);
    
    // Check if we're in development mode or on web platform
    const isDev = __DEV__ || Platform.OS === 'web';
    if (isDev) {
      console.log('Development mode detected, some network scanning features may be limited');
      
      // If we're in web environment, scanning will be very limited
      if (Platform.OS === 'web') {
        console.log('Web environment has limited scanning capabilities due to CORS restrictions');
        // In web environment, we'll return minimal scanning ability
        return {
          success: false,
          reason: 'Limited scanning capabilities in web environment. Please use manual connection.',
          isDevelopment: true,
          isWeb: true
        };
      }
    }
    
    // Check for permissions first (required for Android)
    if (Platform.OS === 'android' && !skipPermissionCheck) {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('WARNING: Location permission not granted - network scan may fail');
          // Try to request the permission
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          if (newStatus !== 'granted') {
            console.log('Location permission denied - cannot scan network properly');
            return { 
              success: false, 
              reason: 'Location permission required for network scanning on Android', 
              permissionDenied: true
            };
          }
        }
      } catch (error) {
        console.log('Error checking location permission:', 
          error instanceof Error ? error.message : 'Unknown error');
        // Continue anyway, but logging the error
      }
    }
    
    this.isScanning = true;
    this.scanAbortController = new AbortController();
    const signal = this.scanAbortController.signal;
    
    const results = [];
    let scannedAddresses = 0;
    let totalAddressesToScan = 0;
    
    // Function to update progress
    const updateProgress = (scanned, total, found = []) => {
      if (onProgress && typeof onProgress === 'function') {
        onProgress({
          scanned,
          total,
          progress: total > 0 ? (scanned / total) * 100 : 0,
          found
        });
      }
    };

    // Try Zeroconf/mDNS discovery first if enabled
    if (useZeroconf) {
      try {
        console.log('Attempting Zeroconf discovery...');
        updateProgress(0, 1, []);
        
        const bonjourResults = await this.discoverViaZeroconf(signal);
        
        if (bonjourResults.length > 0) {
          console.log(`Found ${bonjourResults.length} servers via mDNS/Bonjour`);
          
          // Verify each server found via Zeroconf
          for (const server of bonjourResults) {
            try {
              const result = await this.checkServer(server.ip, server.port, timeout);
              if (result.success) {
                console.log(`Verified Zeroconf server at ${server.ip}:${server.port}`);
                results.push(server);
                await this.saveConnection(server.ip, server.port);
              }
            } catch (e) {
              console.log(`Failed to verify Zeroconf server at ${server.ip}:${server.port}:`, 
                e instanceof Error ? e.message : 'Unknown error');
            }
          }
          
          if (results.length > 0) {
            this.isScanning = false;
            updateProgress(1, 1, results);
            return { success: true, servers: results };
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          this.isScanning = false;
          return { success: false, reason: 'Scan aborted by user' };
        }
        console.log('Zeroconf discovery failed:', 
          error instanceof Error ? error.message : 'Unknown error');
      }
    }
    // Get network information
    const networkInfo = await this.getNetworkInfo();
    console.log('Network info for scanning:', networkInfo);
    
    if (!networkInfo.success) {
      this.isScanning = false;
      return { success: false, reason: networkInfo.reason || 'Could not determine network address' };
    }
    
    const ipAddress = networkInfo.ipAddress;
    const ipParts = ipAddress.split('.');
    
    if (ipParts.length !== 4) {
      this.isScanning = false;
      return { success: false, reason: 'Invalid IP address format' };
    }
    
    // Common ports for PictureFrame server
    const ports = [5000, 3000];
    
    // Define the scanning range
    let subnetsToScan = [];
    
    // Always scan current subnet first
    const currentSubnet = `${ipParts[0]}.${ipParts[1]}`;
    const currentThirdOctet = parseInt(ipParts[2]);
    subnetsToScan.push({ subnet: currentSubnet, thirdOctet: currentThirdOctet, priority: 1 });
    
    // Add other common subnets if we're not limiting to current network
    if (!scanCurrentNetworkOnly) {
      // If we're on a non-standard subnet, add common ones
      if (currentSubnet !== '192.168.1' && currentSubnet !== '192.168.0') {
        subnetsToScan.push({ subnet: '192.168.1', thirdOctet: 1, priority: 2 });
        subnetsToScan.push({ subnet: '192.168.0', thirdOctet: 0, priority: 2 });
      }
      
      // Add other potential subnets
      for (let i = 0; i <= maxThirdOctet; i++) {
        // Skip the ones we've already added
        if ((currentSubnet === '192.168.1' && i === 1) || 
            (currentSubnet === '192.168.0' && i === 0) ||
            (currentSubnet === `${ipParts[0]}.${ipParts[1]}` && i === currentThirdOctet)) {
          continue;
        }
        
        subnetsToScan.push({ subnet: `192.168.${i}`, thirdOctet: i, priority: 3 });
      }
    }
    
    // Sort by priority
    subnetsToScan.sort((a, b) => a.priority - b.priority);
    
    // Track active requests for concurrency control
    let activeRequests = 0;
    const pendingPromises = [];
    
    // Generate the list of addresses to scan
    const addressesToScan = [];
    
    for (const subnetInfo of subnetsToScan) {
      const { subnet, thirdOctet } = subnetInfo;
      
      // Common addresses to prioritize
      const commonFourthOctets = [1, 2, 5, 10, 20, 50, 100, 150, 200, 250, 254];
      
      // Add common addresses first for all subnets
      for (const fourthOctet of commonFourthOctets) {
        for (const port of ports) {
          addressesToScan.push({ 
            ip: `${subnet}.${thirdOctet}.${fourthOctet}`, // Fixed: include thirdOctet
            port, 
            priority: subnetInfo.priority,
            isCommon: true 
          });
        }
      }
      
      // For the current subnet, add more addresses
      if (subnet === currentSubnet && thirdOctet === currentThirdOctet) {
        // Add more addresses in current subnet
        const maxToScan = scanFullSubnet ? 254 : 50;
        
        for (let fourthOctet = 2; fourthOctet <= maxToScan; fourthOctet++) {
          // Skip the common ones we've already added
          if (commonFourthOctets.includes(fourthOctet)) continue;
          
          for (const port of ports) {
            addressesToScan.push({ 
              ip: `${subnet}.${thirdOctet}.${fourthOctet}`, // Fixed: include thirdOctet
              port,
              priority: subnetInfo.priority 
            });
          }
        }
      }
    }
    
    // Sort addresses by priority and whether they're common
    addressesToScan.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.isCommon ? -1 : b.isCommon ? 1 : 0;
    });
    
    totalAddressesToScan = addressesToScan.length;
    console.log(`Prepared to scan ${totalAddressesToScan} IP:port combinations`);
    updateProgress(0, totalAddressesToScan, []);
    
    // Process the queue with limited concurrency
    const processQueue = async () => {
      while (addressesToScan.length > 0 && activeRequests < maxConcurrent) {
        // Check if scan was aborted
        if (signal.aborted) {
          throw new Error('Scan aborted');
        }
        
        const { ip, port } = addressesToScan.shift();
        activeRequests++;
        
        // Start the request but don't await it yet
        const requestPromise = (async () => {
          try {
            const result = await this.checkServer(ip, port, timeout);
            
            // Update progress
            scannedAddresses++;
            updateProgress(scannedAddresses, totalAddressesToScan, results);
            
            if (result.success) {
              console.log(`SUCCESS: Found server at ${ip}:${port}`);
              const serverInfo = { ip, port };
              results.push(serverInfo);
              await this.saveConnection(ip, port);
              
              // Throw a special "success" signal to abort further scanning if we found a server
              if (results.length === 1) {
                this.scanAbortController.abort('Found server');
              }
            }
          } catch (_error) {
            // Ignore errors from individual scans
          } finally {
            activeRequests--;
          }
        })();
        
        pendingPromises.push(requestPromise);
        
        // If we found a server, no need to start more scans
        if (results.length > 0) break;
      }
    };
    
    try {
      // Start scanning in batches
      while (addressesToScan.length > 0 || activeRequests > 0) {
        if (signal.aborted) {
          break;
        }
        
        await processQueue();
        
        // Short wait to allow existing requests to complete
        if (activeRequests > 0 || addressesToScan.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Wait for all pending promises to settle
      await Promise.allSettled(pendingPromises);
      
    } catch (error) {
      console.log('Scan error or aborted:', error.message);
    } finally {
      this.isScanning = false;
    }
    
    console.log(`Scan complete. Found ${results.length} servers. Scanned ${scannedAddresses}/${totalAddressesToScan} addresses.`);
    updateProgress(scannedAddresses, totalAddressesToScan, results);
    
    return {
      success: results.length > 0,
      servers: results,
      scannedAddresses,
      totalAddresses: totalAddressesToScan,
      reason: results.length ? null : signal.aborted ? 'Scan aborted' : 'No servers found'
    };
  }
  
  // Use Zeroconf for mDNS/Bonjour discovery
  async discoverViaZeroconf(signal) {
    // Check location permissions first (required for Android mDNS discovery)
    let hasPermission = true;
    
    if (Platform.OS === 'android') {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission not granted - required for mDNS');
          hasPermission = false;
        }
      } catch (error) {
        console.log('Error checking location permission:', error);
        hasPermission = false;
      }
    }
    
    if (!hasPermission) {
      console.log('Cannot use Zeroconf without location permissions on Android');
      return [];
    }
    
    return new Promise((resolve, reject) => {
      try {
        const results = [];
        const zeroconf = new Zeroconf();
        
        // Check if the scan was aborted
        if (signal) {
          signal.addEventListener('abort', () => {
            zeroconf.stop();
            reject(new Error('Scan aborted'));
          });
        }
        
        zeroconf.on('resolved', service => {
          console.log('Found service via mDNS:', service);
          // Look for Picture Frame servers (could be identified by service name or other properties)
          // Adjust this to match how your server is actually advertised
          if (service.name.toLowerCase().includes('pictureframe') || 
              (service.txt && service.txt.type === 'pictureframe') ||
              service.name.toLowerCase().includes('frame')) {
            
            // Make sure we have addresses
            if (service.addresses && service.addresses.length > 0) {
              // Use the first IP address (usually IPv4)
              results.push({
                ip: service.addresses[0],
                port: service.port,
                name: service.name
              });
            }
          }
        });
        
        // Removed event listeners on error
        zeroconf.on('error', error => {
          console.log('Zeroconf error:', error);
        });
        
        // Start scanning for HTTP services
        zeroconf.scan('_http._tcp.', 'local.');
        
        // Also scan for custom service type if your frame advertises one
        zeroconf.scan('_pictureframe._tcp.', 'local.');
        
        // Set a timeout for discovery
        setTimeout(() => {
          zeroconf.stop();
          console.log('Zeroconf discovery complete. Found:', results);
          resolve(results);
        }, 8000); // Increased timeout for better discovery chance
      } catch (error) {
        console.log('Error in Zeroconf discovery:', error);
        resolve([]);
      }
    });
  }

  // Get network information
  async getNetworkInfo() {
    try {
      console.log('Getting network info for scanning...');
      
      // Check location permissions first (required for accessing WiFi info on Android)
      if (Platform.OS === 'android') {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.log('Location permission not granted - required for network info');
            // Continue anyway, we'll use fallback
          }
        } catch (error) {
          console.log('Error checking location permission:', error);
          // Continue anyway, we'll use fallback
        }
      }
      
      // Get network info
      try {
        const netInfo = await NetInfo.fetch();
        console.log('Network info:', JSON.stringify(netInfo, null, 2));
        
        if (netInfo.type === 'wifi' && netInfo.details && netInfo.details.ipAddress) {
          console.log('Found device IP:', netInfo.details.ipAddress);
          
          // Validate IP address format before using it
          if (this.isValidIpAddress(netInfo.details.ipAddress)) {
            // Calculate subnet if netInfo provides subnet information
            let subnet = null;
            if (netInfo.details.subnet) {
              subnet = netInfo.details.subnet;
            } else {
              // Extract first two octets as subnet
              const ipParts = netInfo.details.ipAddress.split('.');
              if (ipParts.length === 4) {
                subnet = `${ipParts[0]}.${ipParts[1]}`;
              }
            }
            
            return {
              success: true,
              ipAddress: netInfo.details.ipAddress,
              subnet
            };
          } else {
            console.log('Invalid IP address format from NetInfo:', netInfo.details.ipAddress);
          }
        }
      } catch (netInfoError) {
        console.log('Error getting network info:', 
          netInfoError instanceof Error ? netInfoError.message : 'Unknown error');
      }
      
      // Fallback to common networks
      console.log('Using default IP for scanning base: 192.168.1.100');
      return { 
        success: true, 
        ipAddress: '192.168.1.100', 
        subnet: '192.168.1' 
      };
    } catch (error) {
      console.error('Error getting network info:', 
        error instanceof Error ? error.message : 'Unknown error');
      return { success: false, reason: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Manual connection for when automatic discovery fails
  async manualConnect(ip, port = 5000) {
    try {
      const result = await this.checkServer(ip, port);
      if (result.success) {
        await this.saveConnection(ip, port);
        return { success: true, ip, port };
      }
      return { 
        success: false, 
        reason: `Server check failed: ${result.reason || 'Not a picture frame server'}`
      };
    } catch (error) {
      return { success: false, reason: error.message };
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
        internetAccess: false,
        locationPermission: 'unknown',
        hasNetInfo: true
      };

      // Check location permissions
      if (Platform.OS === 'android') {
        try {
          const { status: permStatus } = await Location.getForegroundPermissionsAsync();
          status.locationPermission = permStatus;
        } catch (error) {
          console.log('Error checking location permission:', 
            error instanceof Error ? error.message : 'Unknown error');
          status.locationPermission = 'error';
        }
      }

      // Check basic connectivity
      try {
        const netInfo = await NetInfo.fetch();

        status.isConnected = !!netInfo.isConnected;
        status.isWifi = netInfo.type === 'wifi';
        status.ipAddress = netInfo.details?.ipAddress || null;
        status.wifiName = netInfo.details?.ssid || null;

        console.log('Network status:', netInfo);
      } catch (error) {
        console.log('Error checking network status:', 
          error instanceof Error ? error.message : 'Unknown error');
        status.hasNetInfo = false;
      }

      // Check internet access
      try {
        // Check if we're in development mode or on a web platform
        const isDev = __DEV__ || Platform.OS === 'web';
        
        if (isDev) {
          // In development mode, assume internet connection is available
          // This avoids CORS issues during development
          console.log('Development mode detected, skipping internet connectivity check');
          status.internetAccess = true;
          status.connectivityCheckSkipped = true;
        } else {
          // In production, we can use these connectivity check endpoints
          try {
            // Try native NetInfo first if available
            if (NetInfo.fetch) {
              const netInfoState = await NetInfo.fetch();
              status.internetAccess = netInfoState.isInternetReachable === true;
              console.log('NetInfo internet reachable:', status.internetAccess);
            } else {
              // Fallback to a fetch check on an endpoint that typically doesn't have CORS issues
              await fetch('https://clients3.google.com/generate_204', {
                method: 'HEAD',
                timeout: 3000,
                cache: 'no-cache',
              });
              status.internetAccess = true;
            }
          } catch (error) {
            console.log('Internet connectivity check failed:', 
              error instanceof Error ? error.message : 'Unknown error');
            status.internetAccess = false;
          }
        }
      } catch (error) {
        console.log('Error in connectivity check:', 
          error instanceof Error ? error.message : 'Unknown error');
        status.internetAccess = false;
      }

      return status;
    } catch (error) {
      console.error('Error in network status check:', 
        error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}

export default new NetworkService();