// app.config.js
module.exports = {
  name: "PictureFrameCompanion",
  slug: "pictureframeconpanion",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "pictureframecompanion",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ntumsi.pictureframecompanion",
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera to take photos for your picture frame.",
      NSPhotoLibraryUsageDescription: "This app accesses your photos to send them to your picture frame.",
      NSLocalNetworkUsageDescription: "This app uses your local network to discover and connect to your picture frame.",
      NSBonjourServices: ["_http._tcp", "_pictureframe._tcp"]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    icon: "./assets/images/icon.png",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.ACCESS_WIFI_STATE",
      "android.permission.CHANGE_WIFI_MULTICAST_STATE",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION"
    ],
    intentFilters: [
      {
        action: "android.intent.action.VIEW",
        category: ["android.intent.category.DEFAULT", "android.intent.category.BROWSABLE"],
        data: {
          scheme: "pictureframecompanion"
        }
      }
    ],
    edgeToEdgeEnabled: true,
    package: "com.ntumsi.pictureframeconpanion",
    // Add this for HTTP cleartext traffic
    config: {
      usesCleartextTraffic: true
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      }
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera to take photos for your picture frame."
      }
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos to send them to your picture frame.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos to your photo library.",
        isAccessMediaLocationEnabled: true
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {},
    eas: {
      projectId: "a944f4bd-ba1c-43a6-ada8-255cae70e831"
    }
  },
  owner: "ntumsi"
};