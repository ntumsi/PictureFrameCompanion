# Picture Frame Companion App

A mobile companion app for controlling and managing your Picture Frame server. This app allows you to:

- Discover picture frame servers on your local network
- Upload photos from your device to your picture frame
- View and manage the photo gallery on your picture frame
- Configure picture frame settings

## Download

[![Download APK](https://img.shields.io/badge/Download-APK-brightgreen?style=for-the-badge&logo=android)](https://github.com/ntumsi/PictureFrameCompanion/releases/latest)

[Latest Release](https://github.com/ntumsi/PictureFrameCompanion/releases/latest)

### Installation Instructions

1. Download the APK file using the link above
2. On your Android device, go to Settings → Security 
3. Enable "Unknown sources" or "Install unknown apps" permission for your browser
4. Open the downloaded APK file to install
5. Follow the on-screen instructions to complete installation

## Features

- Auto-discovery of picture frame servers on local network
- Manual connection option for direct IP entry
- Photo gallery management
- Image upload from camera or gallery
- Network diagnostics tools

## Required Permissions

This app requires the following permissions:

- **Location**: Required for network scanning and discovery of picture frames on Android
- **Camera**: For taking photos to upload to your picture frame
- **Storage**: For accessing and uploading photos from your gallery
- **Network**: For connecting to your picture frame server

⚠️ **Important Note**: On Android, location permission is required for WiFi scanning and server discovery. Without this permission, the automatic discovery feature will not work.

## Troubleshooting

### Cannot Find Picture Frame Server

1. **Check Permissions**: Make sure you've granted location permissions on Android
2. **Check WiFi**: Ensure your phone is connected to the same WiFi network as your picture frame
3. **Manual Connection**: If auto-discovery fails, try entering the IP address and port manually
4. **Firewall Issues**: Check if your picture frame server is blocked by a firewall
5. **Debug Screen**: Use the Debug screen to check network connectivity and diagnose issues

### Network Scanner Not Working

1. Check that location services are enabled in your device settings
2. Grant "Allow all the time" location permission if prompted
3. Try rebooting your device
4. Try using a manual connection with the picture frame's IP address

## Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Building & Releasing

Releases are automated via GitHub Actions. Pushing a version tag triggers a production APK build and creates a GitHub Release with the APK attached.

### Create a new release

```bash
git tag v1.1.0
git push origin v1.1.0
```

### Retrigger a release build (same version)

```bash
git push origin :refs/tags/v1.0.0   # delete remote tag
git tag -d v1.0.0                    # delete local tag
git tag v1.0.0                       # re-create tag
git push origin v1.0.0               # push to trigger build
```

### Prerequisites

- An `EXPO_TOKEN` repository secret must be configured in GitHub (Settings > Secrets and variables > Actions)
- Workflow permissions must be set to **Read and write** (Settings > Actions > General > Workflow permissions)

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router (file-based routing)](https://docs.expo.dev/router/introduction)