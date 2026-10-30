#!/usr/bin/env node
/**
 * Configures an iOS project for the CAS.AI SDK.
 *
 *   node casconfig.js <CAS Id> [--plist=<path>] [--no-gad] [--clean]
 *
 * The CAS Id is the App Store id of the application. Without one the script still writes the ad
 * network identifiers and the transport security, which every app needs, and leaves the keys that
 * describe a registered app alone.
 *
 * Replaces the `casconfig.rb` of earlier versions. A host that already parses `Info.plist` itself,
 * as the Expo config plugin does, should call `configureInfoPlist` instead of this entry point.
 */
import fs from 'fs';
import path from 'path';

import { configureInfoPlist } from './infoPlist';
import { readInfoPlist, writeInfoPlist, writeSettingsFile } from './plistFile';
import { readPrebuildStamp } from './stamp';

const colors = {
  error: (text: string) => `\u001b[31m${text}\u001b[0m`,
  success: (text: string) => `\u001b[32m${text}\u001b[0m`,
  warning: (text: string) => `\u001b[33m${text}\u001b[0m`,
  thin: (text: string) => `\u001b[2m${text}\u001b[0m`,
};

function findInfoPlist(): string | null {
  // The build phase of an Xcode target knows exactly which file it uses.
  const fromXcode = process.env.INFOPLIST_FILE;
  if (fromXcode) {
    const root = process.env.SRCROOT ?? process.cwd();
    return path.isAbsolute(fromXcode) ? fromXcode : path.join(root, fromXcode);
  }
  // Otherwise take the single Info.plist of the project folder, the layout Cordova and the
  // React Native template both produce.
  const found: string[] = [];
  const walk = (dir: string, depth: number) => {
    if (depth > 3 || found.length > 1) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.name === 'Info.plist') found.push(full);
    }
  };
  walk(process.cwd(), 0);
  return found.length === 1 ? found[0] : null;
}

/** `node casconfig.js` when run from the package, the file name alone when run as a binary. */
function invocation(): string {
  const name = path.basename(process.argv[1] ?? 'casconfig.js');
  return name.endsWith('.js') ? 'node ' + name : name;
}

function printHelp(): void {
  console.log('');
  console.log(colors.warning('Usage:'));
  console.log('   ' + colors.success(invocation() + ' <CAS Id> [options]'));
  console.log('');
  console.log(colors.warning('Options:'));
  console.log(colors.success('    --plist=<path>'));
  console.log('        Info.plist to configure, when the folder holds more than one');
  console.log(colors.success('    --no-gad'));
  console.log('        Leave the Google Mobile Ads keys out, for an app without AdMob');
  console.log(colors.success('    --clean'));
  console.log('        Replace the identifier lists instead of adding to them, ignoring the cache');
  console.log('');
}

export async function main(argv: string[]): Promise<number> {
  // Left undefined when the caller names none, so that the CAS Id already in Info.plist stands.
  let casId: string | undefined;
  let plistPath: string | null = null;
  let googleAds = true;
  let clean = false;

  for (const argument of argv) {
    if (argument === '--help') {
      printHelp();
      return 0;
    } else if (argument === '--no-gad') {
      googleAds = false;
    } else if (argument === '--clean') {
      clean = true;
    } else if (argument.startsWith('--plist=')) {
      plistPath = argument.slice('--plist='.length);
    } else if (argument.startsWith('--')) {
      console.error(colors.error('[!] Unknown option: ' + argument));
      printHelp();
      return 2;
    } else {
      casId = argument;
    }
  }

  // A prebuild has just written everything this run would write, so there is nothing to do.
  // The stamp carries the version it was written by, so an upgrade without a prebuild still
  // refreshes the identifier lists from here.
  const stamp = readPrebuildStamp(process.env.SRCROOT ?? process.cwd());
  if (stamp.matchesInstalledVersion) {
    console.log(colors.thin('Configured by the Expo prebuild, nothing to do.'));
    return 0;
  }

  plistPath = plistPath ?? findInfoPlist();
  if (plistPath == null) {
    console.error(colors.error('[!] Info.plist not found, name it with --plist='));
    return 2;
  }

  const plist = readInfoPlist(plistPath);
  const { changes, warnings, settingsFile } = await configureInfoPlist(plist, {
    casId,
    googleAds,
    clean,
  });

  if (changes.length > 0) {
    writeInfoPlist(plistPath, plist);
    console.log(colors.success('Updated: ') + plistPath);
    for (const change of changes) console.log('- ' + change);
  } else {
    console.log('Info.plist is up-to-date');
  }

  if (settingsFile != null) {
    const written = writeSettingsFile(plistPath, settingsFile);
    if (written.changed) {
      console.log(colors.success('- Configuration file ' + (written.created ? 'created' : 'updated')));
      console.log('   ' + colors.thin(written.path));
      if (written.created) {
        console.log(colors.warning('   Add this file to the application target in Xcode, once.'));
      }
    }
  }

  for (const warning of warnings) console.log(colors.warning('- ' + warning));

  console.log('');
  console.log(colors.thin('CAS.AI iOS configuration'));
  return 0;
}

if (require.main === module) {
  main(process.argv.slice(2))
    .then(code => process.exit(code))
    .catch(error => {
      console.error(colors.error('[!] ' + (error?.message ?? error)));
      process.exit(1);
    });
}
