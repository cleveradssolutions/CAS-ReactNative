import { ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

import path from 'path';
import { withReactNativeCASMobileAdsAndroid } from './withCasAndroid';
import { withReactNativeCASMobileAdsIOS } from './withCasIos';

export type CASPluginParameters = {
  /**
   * CAS App Id fro iOS platform. In most cases, a CASID is the same as your app store ID.
   * You can find an app store ID in the URL of your app’s Apple App Store URL
   */
  iosCASAppId?: string;

  /**
   * The Optimal Ads Solutions by the CAS.AI contains a number of stable partner networks
   * that are recommended for use in most applications.
   *
   * This solution is optimized for maximum performance, stability, and revenue efficiency.
   */
  includeOptimalAds?: boolean;

  /**
   * The Families Ads Solutions designed by the CAS.AI for applications tagged for a children's audience.
   *
   * The solution is fully compatible with apps participating in the Google Families Ads Program
   * and follows child-directed content advertising policies.
   */
  includeFamiliesAds?: boolean;

  /**
   * The VPN Compliant Ads Solutions by the CAS.AI is designed specifically for applications
   * that provide VPN or Proxy services.
   *
   * This solution includes partner networks and demand sources that are compliant
   * with VPN-related traffic policies and restrictions.
   */
  includeVPNCompliantAds?: boolean;

  /**
   * The Tenjin SDK
   */
  includeTenjinSDK?: boolean;

  /**
   * Include CAS Mediation Adapters to build.
   */
  adapters?: string[];

  /**
   * The Advertising ID is a unique, user-resettable, and user-deletable ID for advertising,
   * provided by Google Play services.
   *
   * Set false if app are building for devices that do not utilize Google Play Services. 
   * For example Amazon or Huawei.
   */
  useAdvertisingId?: boolean;

  /**
   * IOS Only. 
   * To display the App Tracking Transparency authorization request for accessing the IDFA, 
   * update your Info.plist to add the NSUserTrackingUsageDescription key with a custom message describing your usage.
   */
  userTrackingUsageDescription?: string;
};

// Default CAS version = npm package version
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(path.join(__dirname, '..', '..', 'package.json'));
export const CAS_VERSION: string = pkg.version;

const withReactNativeCASMobileAds: ConfigPlugin<CASPluginParameters | void> = (config, props) => {
  let casProps: CASPluginParameters = props ?? {};
  config = withReactNativeCASMobileAdsAndroid(config, casProps);
  config = withReactNativeCASMobileAdsIOS(config, casProps);
  return config;
};

export default createRunOncePlugin(withReactNativeCASMobileAds, pkg.name, pkg.version);
