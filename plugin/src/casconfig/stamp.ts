import fs from 'fs';
import path from 'path';

import { SCRIPT_VERSION } from './version';

/**
 * Both the Expo config plugin and the build phase that autolinking seats in the Xcode target
 * configure the same project. The plugin leaves this stamp in the generated `ios` folder so that
 * the build phase can step aside instead of repeating the work on every build.
 *
 * The stamp records the version that wrote it. An app that updates the package without running a
 * prebuild therefore still gets one pass from the build phase, which is what refreshes the ad
 * network identifiers.
 */
const STAMP_FILE = '.cas-prebuild.json';

type Stamp = { version: string; casId?: string };

export function writePrebuildStamp(iosRoot: string, casId?: string): void {
  const stamp: Stamp = { version: SCRIPT_VERSION, casId };
  try {
    fs.writeFileSync(path.join(iosRoot, STAMP_FILE), JSON.stringify(stamp, null, 2), 'utf8');
  } catch {
    // Without the stamp the build phase simply does the work itself.
  }
}

export function readPrebuildStamp(iosRoot: string): { matchesInstalledVersion: boolean } {
  try {
    const stamp: Stamp = JSON.parse(fs.readFileSync(path.join(iosRoot, STAMP_FILE), 'utf8'));
    return { matchesInstalledVersion: stamp.version === SCRIPT_VERSION };
  } catch {
    return { matchesInstalledVersion: false };
  }
}
