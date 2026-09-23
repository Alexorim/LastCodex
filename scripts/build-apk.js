const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version || '1.3.0';

console.log(`=== Starting build pipeline for LastCodex v${version} ===`);

// 1. Sync versionName in android/app/build.gradle
const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');
  gradleContent = gradleContent.replace(/versionName\s+["'].*?["']/, `versionName "${version}"`);
  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
  console.log(`[1/5] Synchronized android/app/build.gradle versionName to "${version}"`);
}

// 2. Build web production bundle
console.log(`[2/5] Building Angular production web assets...`);
execSync('npx ng build --configuration production', { cwd: rootDir, stdio: 'inherit' });

// 3. Sync to Capacitor
console.log(`[3/5] Syncing Capacitor Android...`);
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

// 4. Assemble APK via Gradle
console.log(`[4/5] Building Android APK via Gradle...`);
const androidDir = path.join(rootDir, 'android');
const gradlewCmd = process.platform === 'win32' ? 'cmd.exe /c "gradlew.bat assembleDebug"' : './gradlew assembleDebug';
execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });

// 5. Manage output APK files
console.log(`[5/5] Managing APK artifacts...`);
const expectedApkName = `lastcodex_${version}.apk`;
const apkSource = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', expectedApkName);

if (!fs.existsSync(apkSource)) {
  console.error(`ERROR: Expected APK not found at: ${apkSource}`);
  process.exit(1);
}

const targetDirs = [
  path.join(rootDir, 'src', 'assets'),
  path.join(rootDir, 'www', 'assets')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Remove all older .apk files in the target directory
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.apk')) {
      const filePath = path.join(dir, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted old APK: ${filePath}`);
    }
  }

  // Copy the fresh APK
  const destPath = path.join(dir, expectedApkName);
  fs.copyFileSync(apkSource, destPath);
  const sizeMb = (fs.statSync(destPath).size / (1024 * 1024)).toFixed(1);
  console.log(`Copied ${expectedApkName} (${sizeMb} MB) to ${destPath}`);
}

console.log(`\nSUCCESS: LastCodex v${version} APK ready as "${expectedApkName}"!\n`);
