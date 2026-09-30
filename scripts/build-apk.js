const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const versionJsonPath = path.join(rootDir, 'src', 'assets', 'version.json');
let version = pkg.version || '1.3.0';
if (fs.existsSync(versionJsonPath)) {
  try {
    const vData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
    if (vData.version) version = vData.version;
  } catch (e) {}
}

console.log(`=== Starting build pipeline for LastCodex v${version} ===`);

// 1. Sync versionName in android/app/build.gradle and src/assets/version.json
const gradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  let gradleContent = fs.readFileSync(gradlePath, 'utf8');
  gradleContent = gradleContent.replace(/versionName\s+["'].*?["']/, `versionName "${version}"`);
  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
  console.log(`[1/5] Synchronized android/app/build.gradle versionName to "${version}"`);
}

const versionMeta = {
  version: version,
  name: "LastResources",
  updatedAt: new Date().toISOString().split('T')[0],
  apkFileName: `lastresources_${version}.apk`,
  downloadUrl: `https://lastresources.vercel.app/assets/lastresources_${version}.apk`,
  mirrorUrl: `https://github.com/Alexorim/LastCodex/raw/main/src/assets/lastresources_${version}.apk`
};
fs.writeFileSync(versionJsonPath, JSON.stringify(versionMeta, null, 2), 'utf8');
console.log(`[1/5] Synchronized src/assets/version.json to version "${version}"`);

// 2. Build web production bundle
console.log(`[2/5] Compiling Obsidian Vault Graph and Angular production web assets...`);
execSync('node scripts/generate-vault-graph.js', { cwd: rootDir, stdio: 'inherit' });
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
const expectedApkName = `lastresources_${version}.apk`;
const apkSource = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', expectedApkName);

if (!fs.existsSync(apkSource)) {
  console.error(`ERROR: Expected APK not found at: ${apkSource}`);
  process.exit(1);
}

const targetDirs = [
  path.join(rootDir, 'src', 'assets'),
  path.join(rootDir, 'www', 'assets'),
  path.join(rootDir, 'release')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Copy the primary versioned APK
  const destPath = path.join(dir, expectedApkName);
  fs.copyFileSync(apkSource, destPath);
  console.log(`Copied APK: ${expectedApkName} to ${destPath}`);

  // Keep compatibility aliases
  const aliases = [`lastresources_stable.apk`, 'lastcodex_stable.apk', `lastcodex_${version}.apk`, 'LastCodex.apk'];
  for (const alias of aliases) {
    const aliasPath = path.join(dir, alias);
    fs.copyFileSync(apkSource, aliasPath);
  }
}

console.log(`\nSUCCESS: LastResources APK ready as "${expectedApkName}"!\n`);
