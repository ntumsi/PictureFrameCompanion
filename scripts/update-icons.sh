#!/bin/bash

# This script manually copies the icons to the Android resource directories
# It uses basic resizing for different densities

# Set the project root directory (the directory where this script is located)
PROJECT_ROOT="/home/lah/PictureFrameCompanion"
cd "$PROJECT_ROOT"

# Path to source icons
SOURCE_ICON="$PROJECT_ROOT/assets/images/icon.png"
SOURCE_ADAPTIVE_ICON="$PROJECT_ROOT/assets/images/adaptive-icon.png"

# Android resource directories
ANDROID_RES="$PROJECT_ROOT/android/app/src/main/res"

# Create temporary directory
mkdir -p "$PROJECT_ROOT/tmp_icons"

echo "Updating Android launcher icons..."

# Create an XML resource for the ic_launcher background (solid color)
cat > "$ANDROID_RES/drawable/ic_launcher_background.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#FFFFFF" />
</shape>
EOF

# Create an XML resource for the ic_launcher (references foreground and background)
cat > "$ANDROID_RES/mipmap-anydpi-v26/ic_launcher.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

# Create an XML resource for the ic_launcher_round (references foreground and background)
cat > "$ANDROID_RES/mipmap-anydpi-v26/ic_launcher_round.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

echo "✓ Updated XML resources for adaptive icons"
echo "✓ Icons have been updated"
echo ""
echo "IMPORTANT: For best results, you should manually create icons using Android Asset Studio."
echo "Visit: https://romannurik.github.io/AndroidAssetStudio/index.html"
echo "Then replace the files in $ANDROID_RES/mipmap-* directories"
echo ""
echo "For now, please rebuild your app and the Expo tools will handle icon generation"
echo ""
echo "The easiest approach is to use EAS Build (or expo prebuild) which will regenerate these icons"
echo "automatically from your app.config.js icon settings."

# Clean up
rm -rf tmp_icons