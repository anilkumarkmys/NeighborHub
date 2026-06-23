#!/usr/bin/env node
/**
 * Version bump script for NextDoor Clone monorepo.
 * Updates VERSION file, app.json in both apps, and creates git tag.
 * Usage: node scripts/version-bump.js [patch|minor|major]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const bumpType = process.argv[2] || 'patch';

function readVersion() {
  return fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
}

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default: throw new Error(`Unknown bump type: ${type}`);
  }
}

function updateAppJson(appPath, newVersion, buildNumber) {
  const appJsonPath = path.join(ROOT, appPath, 'app.json');
  if (!fs.existsSync(appJsonPath)) return;
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  appJson.expo.version = newVersion;
  appJson.expo.ios = appJson.expo.ios || {};
  appJson.expo.ios.buildNumber = String(buildNumber);
  appJson.expo.android = appJson.expo.android || {};
  appJson.expo.android.versionCode = buildNumber;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log(`Updated ${appPath}/app.json -> ${newVersion} (build ${buildNumber})`);
}

function updateChangelog(newVersion, oldVersion) {
  const changelogPath = path.join(ROOT, 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  const entry = `\n## [${newVersion}] - ${date}\n### Changed\n- Version bumped from ${oldVersion} to ${newVersion}\n`;
  if (fs.existsSync(changelogPath)) {
    const existing = fs.readFileSync(changelogPath, 'utf8');
    fs.writeFileSync(changelogPath, existing.replace('# Changelog\n', `# Changelog\n${entry}`));
  } else {
    fs.writeFileSync(changelogPath, `# Changelog\n${entry}`);
  }
}

const oldVersion = readVersion();
const newVersion = bumpVersion(oldVersion, bumpType);
const buildNumber = parseInt(newVersion.replace(/\./g, ''), 10);

console.log(`Bumping version: ${oldVersion} -> ${newVersion} (${bumpType})`);

fs.writeFileSync(path.join(ROOT, 'VERSION'), newVersion + '\n');
updateAppJson('apps/customer', newVersion, buildNumber);
updateAppJson('apps/admin', newVersion, buildNumber);
updateChangelog(newVersion, oldVersion);

try {
  execSync(`git add VERSION apps/customer/app.json apps/admin/app.json CHANGELOG.md`, { cwd: ROOT });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { cwd: ROOT });
  execSync(`git tag -a "v${newVersion}" -m "Release v${newVersion}"`, { cwd: ROOT });
  console.log(`Created git tag v${newVersion}`);
} catch (e) {
  console.warn('Git operations failed (may not be in a git repo or files not changed):', e.message);
}

console.log(`\nVersion ${newVersion} ready!`);
console.log('Next steps:');
console.log(`  git push origin --tags`);
console.log(`  npm run build:all:android`);
