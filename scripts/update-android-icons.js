const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_ICON = path.join(PROJECT_ROOT, 'assets', 'images', 'icon.png');
const SOURCE_ADAPTIVE_ICON = path.join(PROJECT_ROOT, 'assets', 'images', 'adaptive-icon.png');
const ANDROID_RES_DIR = path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res');

// Android icon sizes
const ANDROID_ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Create temporary directory
const TMP_DIR = path.join(PROJECT_ROOT, 'tmp_icons');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Generate regular icons
console.log('Generating Android launcher icons...');
Object.entries(ANDROID_ICON_SIZES).forEach(([folder, size]) => {
  const outputPath = path.join(TMP_DIR, `ic_launcher_${folder}.png`);
  const targetPath = path.join(ANDROID_RES_DIR, folder, 'ic_launcher.webp');
  const targetRoundPath = path.join(ANDROID_RES_DIR, folder, 'ic_launcher_round.webp');
  
  try {
    // Generate the resized PNG
    execSync(`npx sharp-cli resize ${size} ${size} < "${SOURCE_ICON}" > "${outputPath}"`);
    
    // Convert to webp
    execSync(`cwebp "${outputPath}" -o "${targetPath}" -quiet`);
    execSync(`cwebp "${outputPath}" -o "${targetRoundPath}" -quiet`);
    
    console.log(`✅ Updated ${folder}/ic_launcher.webp`);
  } catch (error) {
    console.error(`❌ Error processing ${folder}:`, error.message);
  }
});

// Generate adaptive icons (foreground)
console.log('Generating Android adaptive icons...');
Object.entries(ANDROID_ICON_SIZES).forEach(([folder, size]) => {
  const outputPath = path.join(TMP_DIR, `ic_launcher_foreground_${folder}.png`);
  const targetPath = path.join(ANDROID_RES_DIR, folder, 'ic_launcher_foreground.webp');
  
  try {
    // For adaptive icons, we resize to 72% of the target size to account for padding
    const adaptiveSize = Math.floor(size * 1.4); // 140% to account for padding
    
    // Generate the resized PNG
    execSync(`npx sharp-cli resize ${adaptiveSize} ${adaptiveSize} < "${SOURCE_ADAPTIVE_ICON}" > "${outputPath}"`);
    
    // Convert to webp
    execSync(`cwebp "${outputPath}" -o "${targetPath}" -quiet`);
    
    console.log(`✅ Updated ${folder}/ic_launcher_foreground.webp`);
  } catch (error) {
    console.error(`❌ Error processing ${folder} foreground:`, error.message);
  }
});

console.log('Icon generation complete!');

// Clean up
console.log('Cleaning up temporary files...');
fs.rmSync(TMP_DIR, { recursive: true, force: true });