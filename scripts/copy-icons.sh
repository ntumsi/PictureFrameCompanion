#!/bin/bash

# This script copies the icon images to the proper Android resource directories

# Set the project root directory
PROJECT_ROOT="/home/lah/PictureFrameCompanion"
cd "$PROJECT_ROOT"

# Path to source icons
SOURCE_ICON="$PROJECT_ROOT/assets/images/icon.png"
SOURCE_ADAPTIVE_ICON="$PROJECT_ROOT/assets/images/adaptive-icon.png"

# Android resource directories
ANDROID_RES="$PROJECT_ROOT/android/app/src/main/res"

echo "Copying icons to Android resource directories..."

# Copy icon.png to mipmap directories
echo "Copying launcher icons..."
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-mdpi/ic_launcher.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-hdpi/ic_launcher.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-xhdpi/ic_launcher.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-xxhdpi/ic_launcher.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher.png"

# Copy round icons
echo "Copying round launcher icons..."
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-mdpi/ic_launcher_round.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-hdpi/ic_launcher_round.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-xhdpi/ic_launcher_round.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-xxhdpi/ic_launcher_round.png"
cp "$SOURCE_ICON" "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher_round.png"

# Copy adaptive icon foreground
echo "Copying adaptive icon foregrounds..."
cp "$SOURCE_ADAPTIVE_ICON" "$ANDROID_RES/mipmap-mdpi/ic_launcher_foreground.png"
cp "$SOURCE_ADAPTIVE_ICON" "$ANDROID_RES/mipmap-hdpi/ic_launcher_foreground.png"
cp "$SOURCE_ADAPTIVE_ICON" "$ANDROID_RES/mipmap-xhdpi/ic_launcher_foreground.png"
cp "$SOURCE_ADAPTIVE_ICON" "$ANDROID_RES/mipmap-xxhdpi/ic_launcher_foreground.png"
cp "$SOURCE_ADAPTIVE_ICON" "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher_foreground.png"

echo "✓ Icons copied successfully"
echo ""
echo "NOTE: These are not resized for each density, which is not ideal."
echo "For best results, run 'npx expo prebuild --clean' to regenerate all resources."