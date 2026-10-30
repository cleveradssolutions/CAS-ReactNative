import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import type { InfoPlist } from './infoPlist';

/**
 * Reads and writes `Info.plist` through `plutil`, which every macOS carries, so that configuring a
 * project needs no package beyond Node itself.
 *
 * The round trip goes through JSON, which holds strings, numbers, booleans, arrays and
 * dictionaries. A plist that also carries `data` or `date` values cannot be represented, and
 * `plutil` says so rather than dropping them; the error is passed on instead of writing a file
 * that lost something.
 */
export function readInfoPlist(plistPath: string): InfoPlist {
  if (!fs.existsSync(plistPath)) return {};
  try {
    const json = execFileSync('plutil', ['-convert', 'json', '-o', '-', plistPath], {
      encoding: 'utf8',
    });
    return JSON.parse(json);
  } catch (error: any) {
    throw new Error(`Could not read ${plistPath}: ${error.stderr?.toString().trim() || error}`);
  }
}

export function writeInfoPlist(plistPath: string, plist: InfoPlist): void {
  const temporary = path.join(
    os.tmpdir(),
    `cas-info-${process.pid}-${path.basename(plistPath)}.json`,
  );
  try {
    fs.writeFileSync(temporary, JSON.stringify(plist), 'utf8');
    execFileSync('plutil', ['-convert', 'xml1', '-o', plistPath, temporary]);
  } catch (error: any) {
    throw new Error(`Could not write ${plistPath}: ${error.stderr?.toString().trim() || error}`);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}

/**
 * Writes the configuration file beside `Info.plist`, where the SDK looks for it, and reports
 * whether anything changed so that a caller can skip registering a file that is already in place.
 */
export function writeSettingsFile(
  plistPath: string,
  settings: { name: string; body: string },
): { path: string; created: boolean; changed: boolean } {
  const target = path.join(path.dirname(plistPath), settings.name);
  const created = !fs.existsSync(target);
  const changed = created || fs.readFileSync(target, 'utf8') !== settings.body;
  if (changed) fs.writeFileSync(target, settings.body, 'utf8');
  return { path: target, created, changed };
}
