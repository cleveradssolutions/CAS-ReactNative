import {
  ConfigPlugin,
  withInfoPlist,
  withDangerousMod,
  InfoPlist,
  WarningAggregator,
} from '@expo/config-plugins';
import { type CASPluginParameters, CAS_VERSION } from './index';
import fs from 'fs';
import path from 'path';
const { spawnSync } = require('child_process');

function getPodNameForAdapter(adapter: string): string {
  switch (adapter) {
    case 'casExchange':
      return 'CASExchange';
    case 'dtExchange':
      return 'DTExchange';
    case 'pubmatic':
      return 'PubMatic';
    default:
      return adapter.charAt(0).toUpperCase() + adapter.slice(1);
  }
}

function getPodLineForAdapter(adapter: string): string {
  let podName = getPodNameForAdapter(adapter);
  return `  pod 'CleverAdsSolutions-SDK/${podName}', '${CAS_VERSION}'`;
}

function withCASIOSPodfile(config: any, props: CASPluginParameters) {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const GLOBAL_SOURCE_SPECS = "source 'https://github.com/CocoaPods/Specs.git'";
      const CAS_SOURCE_SPECS = "source 'https://github.com/cleveradssolutions/CAS-Specs.git'";
      const PODS_START = '  # CAS.AI Ads Mediation pods';
      const PODS_END = '  # End CAS.AI Ads Mediation pods';

      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) {
        WarningAggregator.addWarningIOS('react-native-cas', 'Not found: ' + podfilePath);
        return config;
      }

      const lines = fs.readFileSync(podfilePath, 'utf8').split('\n');

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

      if (Array.isArray(props.adapters) && props.adapters.length) {
        for (const adapter of props.adapters) {
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
          return t.startsWith('target ') && t.endsWith(' do');
        });

        if (targetIndex !== -1) {
          lines.splice(targetIndex + 1, 0, ...podLines);
        } else {
          WarningAggregator.addWarningIOS('react-native-cas', 'App Target block in ' + podfilePath);
        }
      }

      fs.writeFileSync(podfilePath, lines.join('\n'));
      return config;
    },
  ]);
}

function withCASIOSConfigScript(config: any, props: CASPluginParameters) {
  return withDangerousMod(config, [
    'ios',
    async config => {
      const iosRoot = config.modRequest.platformProjectRoot;
      const xcodeproj = path.join(iosRoot, config.modRequest.projectName + `.xcodeproj`);
      const pkgRoot = path.dirname(require.resolve('react-native-cas/package.json'));
      const rubyScript = path.join(pkgRoot, 'plugin', 'casconfig.rb');

      if (!fs.existsSync(rubyScript)) {
        WarningAggregator.addWarningIOS(
          'react-native-cas',
          'casconfig.rb not found in package. Please reimport package',
        );
        return config;
      }

      const casId = props.iosCASAppId || 'demo';
      const result = spawnSync('ruby', [rubyScript, casId, '--project=' + xcodeproj], {
        encoding: 'utf8',
      });

      if (result.error) {
        WarningAggregator.addWarningIOS(
          'react-native-cas',
          'Error spawning CAS Ruby script: ' + result.error,
        );
      } else {
        console.log('[CAS.AI] Ruby script:', result.stdout);

        if (result.stderr) {
          console.error(result.stderr);
        }
        if (result.status != 0) {
          WarningAggregator.addWarningIOS(
            'react-native-cas',
            'Ruby script error status: ' + result.status,
          );
        }
      }
      return config;
    },
  ]);
}

function withCASIOSInfoPlist(config: any, props: CASPluginParameters) {
  return withInfoPlist(config, config => {
    const plist: InfoPlist = config.modResults;
    if (props.useAdvertisingId === false) {
      delete plist.NSUserTrackingUsageDescription;
    } else if (props.userTrackingUsageDescription) {
      plist.NSUserTrackingUsageDescription = props.userTrackingUsageDescription;
    }
    return config;
  });
}

export const withReactNativeCASMobileAdsIOS: ConfigPlugin<CASPluginParameters> = (
  config,
  props,
) => {
  config = withCASIOSPodfile(config, props);
  config = withCASIOSConfigScript(config, props);
  // Process InfoPlist after Config Script
  config = withCASIOSInfoPlist(config, props);
  return config;
};
