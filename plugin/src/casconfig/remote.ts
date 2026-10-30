import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

/** The ad network identifier lists and the app configuration are refreshed twice a day. */
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const CACHE_DIR = path.join(
  os.homedir(),
  'Library',
  'Caches',
  'com.cleveradssolutions.configuration',
);

const SKADNETWORK_URL =
  'https://raw.githubusercontent.com/cleveradssolutions/CAS-iOS/master/AdNetworkIdentifiers/SKAdNetworkCompact.txt';

const ADATTRIBUTION_URL =
  'https://raw.githubusercontent.com/cleveradssolutions/CAS-iOS/master/AdNetworkIdentifiers/AdNetworkCompact.txt';

const APP_CONFIG_URL = 'https://promo.psvgamestudio.com/cas-settings.php?platform=1&apply=config';

export type AppConfiguration = {
  /** Body of the configuration file, empty when the CAS Id has none. */
  body: string;
  /** File name the server asks for, `cas_settings.json` when it names none. */
  name: string;
};

function cachePathOf(url: string): string {
  return path.join(CACHE_DIR, crypto.createHash('md5').update(url).digest('hex'));
}

function isExpired(file: string, clean: boolean): boolean {
  if (clean) return true;
  try {
    return Date.now() - fs.statSync(file).mtimeMs > CACHE_TTL_MS;
  } catch {
    return true;
  }
}

/** Drops every cache entry that has outlived its time, so the directory cannot grow forever. */
function sweepCache(): void {
  try {
    for (const name of fs.readdirSync(CACHE_DIR)) {
      const file = path.join(CACHE_DIR, name);
      if (isExpired(file, false)) fs.rmSync(file, { force: true });
    }
  } catch {
    // The cache is an optimisation. Losing it costs a request, never the run.
  }
}

async function fetchWithCache(
  url: string,
  clean: boolean,
  read: (response: Response) => Promise<string>,
): Promise<string> {
  const cacheFile = cachePathOf(url);
  if (!isExpired(cacheFile, clean)) {
    try {
      const cached = fs.readFileSync(cacheFile, 'utf8');
      if (cached.length > 0) return cached;
    } catch {
      // Fall through to the request.
    }
  }
  sweepCache();

  const body = await read(await fetch(url));
  if (body.length > 0) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cacheFile, body, 'utf8');
    } catch {
      // Writing the cache is best effort.
    }
  }
  return body;
}

async function loadIdentifiers(url: string, suffix: string, clean: boolean): Promise<string[]> {
  const body = await fetchWithCache(url, clean, async response => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} for ${url}`);
    }
    return response.text();
  });

  return body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line + suffix);
}

/** Identifiers of every ad network CAS.AI mediates, for `SKAdNetworkItems`. */
export function loadSKAdNetworkIds(clean = false): Promise<string[]> {
  return loadIdentifiers(SKADNETWORK_URL, '.skadnetwork', clean);
}

/** The same networks in the form AdAttributionKit expects, for `AdNetworkIdentifiers`. */
export function loadAdAttributionIds(clean = false): Promise<string[]> {
  return loadIdentifiers(ADATTRIBUTION_URL, '.adattributionkit', clean);
}

/**
 * The configuration CAS.AI holds for the app, which the SDK reads on the very first launch,
 * before it has an answer from the server of its own.
 */
export async function loadAppConfiguration(
  casId: string,
  clean = false,
): Promise<AppConfiguration | null> {
  if (!casId || casId === 'demo') return null;

  const url = `${APP_CONFIG_URL}&bundle=${encodeURIComponent(casId)}`;
  const cached = await fetchWithCache(url, clean, async response => {
    if (response.status === 204) {
      throw new Error(`CAS Id ${casId} is not registered.`);
    }
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} for the app configuration`);
    }
    const disposition = response.headers.get('content-disposition') ?? '';
    const name = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'cas_settings.json';
    return JSON.stringify({ name, body: await response.text() });
  });

  if (cached.length === 0) return null;
  const { name, body } = JSON.parse(cached) as AppConfiguration;
  return body.length > 0 ? { name, body } : null;
}
