import {
  ConfigPlugin,
  withInfoPlist,
  InfoPlist,
  WarningAggregator,
  withPodfile,
} from '@expo/config-plugins';
import { type CASPluginParameters, CAS_NAMES_DIFF, CAS_VERSION } from './index';

function withCASIOSInfoPlist(config: any, props: CASPluginParameters) {
  return withInfoPlist(config, config => {
    var plist: InfoPlist = config.modResults;

    if (props.iosAppId) {
      plist.CASAIAppIdentifier = props.iosAppId;
    } else {
      delete plist.CASAIAppIdentifier;
    }

    if (props.userTrackingUsageDescription) {
      plist.NSUserTrackingUsageDescription = props.userTrackingUsageDescription;
    }

    const ats: any = plist.NSAppTransportSecurity ?? {};
    plist.NSAppTransportSecurity = {
      ...ats,
      NSAllowsArbitraryLoads: true,
    };

    config.modResults = plist;
    return config;
  });
}

function getPodLineForAdapter(adapter: string): string {
  let podName = CAS_NAMES_DIFF[adapter] ?? adapter.charAt(0).toUpperCase() + adapter.slice(1);
  return `  pod 'CleverAdsSolutions-SDK/${podName}', '${CAS_VERSION}'`;
}

function withCASIOSPodfile(config: any, props: CASPluginParameters) {
  return withPodfile(config, async config => {
    const GLOBAL_SOURCE_SPECS = "source 'https://github.com/CocoaPods/Specs.git'";
    const CAS_SOURCE_SPECS = "source 'https://github.com/cleveradssolutions/CAS-Specs.git'";
    const PODS_START = '  # CAS.AI Ads Mediation pods';
    const PODS_END = '  # End CAS.AI Ads Mediation pods';

    var lines = config.modResults.contents.split('\n');
    if (!lines.includes(CAS_SOURCE_SPECS)) {
      lines.unshift(GLOBAL_SOURCE_SPECS, CAS_SOURCE_SPECS);
    }
    var podLines: string[] = [PODS_START];
    if (props.includeOptimalAds === true) {
      podLines.push(getPodLineForAdapter('Optimal'));
    }
    if (props.includeFamiliesAds === true) {
      podLines.push(getPodLineForAdapter('Families'));
    }
    if (props.includeVPNCompliantAds === true) {
      podLines.push(getPodLineForAdapter('VPNCompliant'));
    }
    if (props.includeTenjinSDK === true) {
      podLines.push(getPodLineForAdapter('Tenjin'));
    }

    if (Array.isArray(props.iosAdapters) && props.iosAdapters.length) {
      for (const adapter of props.iosAdapters) {
        podLines.push(getPodLineForAdapter(adapter));
      }
    }
    podLines.push(PODS_END);

    const startIndex = lines.indexOf(PODS_START);
    const endIndex = lines.indexOf(PODS_END);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      lines.splice(startIndex, endIndex - startIndex + 1, ...podLines);
    } else {
      const targetIndex = lines.findIndex(l => {
        const t = l.trim();
        return t.startsWith('use_expo_modules!');
      });

      if (targetIndex !== -1) {
        lines.splice(targetIndex + 1, 0, ...podLines);
      } else {
        WarningAggregator.addWarningIOS(
          'react-native-cas',
          'Not found App Target block with use_expo_modules! in Podfile',
        );
      }
    }

    config.modResults.contents = lines.join('\n');
    return config;
  });
}

export const withReactNativeCASMobileAdsIOS: ConfigPlugin<CASPluginParameters> = (
  config,
  props,
) => {
  config = withCASIOSInfoPlist(config, props);
  config = withCASIOSPodfile(config, props);
  return config;
};
