import { loadAdAttributionIds, loadAppConfiguration, loadSKAdNetworkIds } from './remote';

/** The subset of `Info.plist` this configuration touches. */
export type InfoPlist = Record<string, any>;

export type ConfigureOptions = {
  /** CAS Id of the application, the same value as its App Store id. */
  casId?: string;
  /** `false` when the app ships without the Google Mobile Ads adapter. */
  googleAds?: boolean;
  /** Replaces the lists instead of adding to them, and ignores the cache. */
  clean?: boolean;
  /** Message of the App Tracking Transparency prompt, when the app has none yet. */
  trackingUsageDescription?: string;
};

export type ConfigureResult = {
  /** One line per key, in the order they were handled. */
  changes: string[];
  /** Problems the publisher has to resolve, the configuration itself stays valid. */
  warnings: string[];
  /** The configuration file to ship in the bundle, `null` when the CAS Id has none. */
  settingsFile: { name: string; body: string } | null;
};

const KEY_SKAD_ARRAY = 'SKAdNetworkItems';
const KEY_SKAD = 'SKAdNetworkIdentifier';
const KEY_ATTAD_ARRAY = 'AdNetworkIdentifiers';
const KEY_SECURITY = 'NSAppTransportSecurity';
const KEY_ALLOWS_LOADS = 'NSAllowsArbitraryLoads';
const KEY_CAS_APP_ID = 'CASAIAppIdentifier';
const KEY_GAD_APP_ID = 'GADApplicationIdentifier';
const KEY_GAD_DELAY_INIT = 'GADDelayAppMeasurementInit';
const KEY_GAD_AD_VALIDATOR = 'GADNativeAdValidatorEnabled';
const KEY_TRACKING_USAGE = 'NSUserTrackingUsageDescription';
const KEY_BOUND_DOMAINS = 'WKAppBoundDomains';

const DEFAULT_TRACKING_USAGE =
  'Your data will remain confidential and will only be used to provide you a better and personalised ad experience';

/** The demo app id of Google, used while the CAS Id has no AdMob app of its own. */
const DEMO_GAD_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

function applySKAdNetworkItems(plist: InfoPlist, required: string[], clean: boolean): string | null {
  const existing: Array<Record<string, string>> =
    !clean && Array.isArray(plist[KEY_SKAD_ARRAY]) ? plist[KEY_SKAD_ARRAY] : [];
  const present = new Set(existing.map(item => item?.[KEY_SKAD]));
  const missing = required.filter(id => !present.has(id));

  plist[KEY_SKAD_ARRAY] = existing.concat(missing.map(id => ({ [KEY_SKAD]: id })));
  return missing.length > 0 ? `${KEY_SKAD_ARRAY}: ${missing.length} new items` : null;
}

function applyAdNetworkIdentifiers(
  plist: InfoPlist,
  required: string[],
  clean: boolean,
): string | null {
  const existing: string[] =
    !clean && Array.isArray(plist[KEY_ATTAD_ARRAY]) ? plist[KEY_ATTAD_ARRAY] : [];
  const present = new Set(existing);
  const missing = required.filter(id => !present.has(id));

  plist[KEY_ATTAD_ARRAY] = existing.concat(missing);
  return missing.length > 0 ? `${KEY_ATTAD_ARRAY}: ${missing.length} new items` : null;
}

function applyTransportSecurity(plist: InfoPlist): string | null {
  const security = plist[KEY_SECURITY];
  if (security != null && security[KEY_ALLOWS_LOADS] != null) {
    // A publisher who turned it off on purpose keeps their choice.
    return null;
  }
  // IronSource requires a cleartext HTTP resource load.
  plist[KEY_SECURITY] = { ...(security ?? {}), [KEY_ALLOWS_LOADS]: true };
  return `${KEY_SECURITY}: added`;
}

function applyCasAppId(plist: InfoPlist, casId: string): string | null {
  if (!casId || casId === 'demo' || plist[KEY_CAS_APP_ID] === casId) return null;
  const added = plist[KEY_CAS_APP_ID] == null;
  plist[KEY_CAS_APP_ID] = casId;
  return `${KEY_CAS_APP_ID}: ${added ? 'added' : 'updated'}`;
}

function applyGoogleAppId(plist: InfoPlist, settings: string | null): string | null {
  const required = /"admob_app_id"\s*:\s*"([^"]+)"/.exec(settings ?? '')?.[1] ?? DEMO_GAD_APP_ID;
  if (plist[KEY_GAD_APP_ID] === required) return null;

  const added = plist[KEY_GAD_APP_ID] == null;
  plist[KEY_GAD_APP_ID] = required;
  plist[KEY_GAD_DELAY_INIT] = true;
  plist[KEY_GAD_AD_VALIDATOR] = false;
  return `${KEY_GAD_APP_ID}: ${added ? 'added' : 'updated'}`;
}

function applyTrackingUsageDescription(plist: InfoPlist, description: string): string | null {
  const current = plist[KEY_TRACKING_USAGE];
  if (typeof current === 'string' && current.length > 0) return null;
  plist[KEY_TRACKING_USAGE] = description;
  return `${KEY_TRACKING_USAGE}: added`;
}

/**
 * Brings `Info.plist` in line with what the CAS.AI SDK needs. The object is edited in place, so a
 * caller that already holds a parsed plist, as the Expo config plugin does, has nothing to write.
 */
export async function configureInfoPlist(
  plist: InfoPlist,
  options: ConfigureOptions = {},
): Promise<ConfigureResult> {
  const clean = options.clean === true;
  const casId = options.casId ?? String(plist[KEY_CAS_APP_ID] ?? '');

  const [skAdNetworkIds, adAttributionIds, settings] = await Promise.all([
    loadSKAdNetworkIds(clean),
    loadAdAttributionIds(clean),
    loadAppConfiguration(casId, clean),
  ]);

  const changes = [
    applySKAdNetworkItems(plist, skAdNetworkIds, clean),
    applyAdNetworkIdentifiers(plist, adAttributionIds, clean),
    applyTransportSecurity(plist),
    applyCasAppId(plist, casId),
    options.googleAds === false ? null : applyGoogleAppId(plist, settings?.body ?? null),
    applyTrackingUsageDescription(plist, options.trackingUsageDescription ?? DEFAULT_TRACKING_USAGE),
  ].filter((change): change is string => change != null);

  const warnings: string[] = [];
  if (plist[KEY_BOUND_DOMAINS] != null) {
    warnings.push(
      `${KEY_BOUND_DOMAINS} is not supported by CAS.AI and the SDK might fail to load ads. ` +
        `Remove the key from Info.plist.`,
    );
  }

  return { changes, warnings, settingsFile: settings };
}
