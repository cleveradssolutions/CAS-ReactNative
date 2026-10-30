import {
  ConfigPlugin,
  withInfoPlist,
  InfoPlist,
  WarningAggregator,
  withPodfile,
  withDangerousMod,
  withXcodeProject,
} from '@expo/config-plugins';
import { type CASPluginParameters, CAS_NAMES_DIFF, CAS_VERSION } from './index';
import { configureInfoPlist, writePrebuildStamp, writeSettingsFile } from './casconfig';
import path from 'path';
import fs from 'fs';

/** Name of the configuration file the last prebuild wrote, to register it in the project. */
let settingsFileName: string | null = null;

/** CAS Id the plist mod used, recorded in the stamp the build phase reads. */
let casIdOfLastRun: string | null = null;

function withCASIOSInfoPlist(config: any, props: CASPluginParameters) {
  return withInfoPlist(config, async config => {
    const plist: InfoPlist = config.modResults;

    if (props.iosAppId) {
      plist.CASAIAppIdentifier = props.iosAppId;
    } else {
      delete plist.CASAIAppIdentifier;
    }

    const { changes, warnings, settingsFile } = await configureInfoPlist(plist, {
      casId: props.iosAppId,
      trackingUsageDescription: props.userTrackingUsageDescription,
    });

    for (const warning of warnings) {
      WarningAggregator.addWarningIOS('react-native-cas', warning);
    }
    if (changes.length > 0) {
      console.log('[CAS.AI] Info.plist: ' + changes.join(', '));
    }

    casIdOfLastRun = props.iosAppId ?? null;
    settingsFileName = settingsFile?.name ?? null;
    if (settingsFile != null) {
      // `withInfoPlist` holds the parsed plist, not its path, so the file that belongs beside it
      // is written in the dangerous mod below, where the project paths are known.
      pendingSettingsFile = settingsFile;
    }

    config.modResults = plist;
    return config;
  });
}

/** Configuration body waiting to be written beside `Info.plist`. */
let pendingSettingsFile: { name: string; body: string } | null = null;

/**
 * Writes the configuration file CAS.AI holds for the app, which the SDK reads on the very first
 * launch, and registers it in the application target so that it reaches the bundle.
 */
function withCASIOSSettingsFile(config: any) {
  config = withDangerousMod(config, [
    'ios',
    async config => {
      if (config.modRequest.introspect) return config;

      const iosRoot = config.modRequest.platformProjectRoot;
      if (pendingSettingsFile != null) {
        const plistPath = path.join(iosRoot, config.modRequest.projectName!, 'Info.plist');
        const written = writeSettingsFile(plistPath, pendingSettingsFile);
        if (written.changed) {
          console.log('[CAS.AI] Configuration file: ' + path.basename(written.path));
        }
      }
      // Tells the build phase that autolinking seats in the target that the project is already
      // configured, so that it does not repeat this work on every build.
      writePrebuildStamp(iosRoot, casIdOfLastRun ?? undefined);
      return config;
    },
  ]);

  return withXcodeProject(config, config => {
    if (settingsFileName == null) return config;

    const project = config.modResults;
    const group = config.modRequest.projectName!;
    if (project.hasFile(`${group}/${settingsFileName}`)) return config;

    project.addResourceFile(`${group}/${settingsFileName}`, {}, project.getFirstProject().firstProject.mainGroup);
    return config;
  });
}

/** Adapters ship Objective-C categories that the linker drops without `-ObjC`. */
function withCASIOSLinkerFlags(config: any) {
  return withXcodeProject(config, config => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const key of Object.keys(configurations)) {
      const buildSettings = configurations[key]?.buildSettings;
      if (buildSettings == null || buildSettings.PRODUCT_NAME == null) continue;

      const flags: string[] = Array.isArray(buildSettings.OTHER_LDFLAGS)
        ? buildSettings.OTHER_LDFLAGS
        : buildSettings.OTHER_LDFLAGS
          ? [buildSettings.OTHER_LDFLAGS]
          : ['"$(inherited)"'];

      if (!flags.includes('"-ObjC"') && !flags.includes('-ObjC')) {
        flags.push('"-ObjC"');
        buildSettings.OTHER_LDFLAGS = flags;
      }
    }
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
  config = withCASIOSSettingsFile(config);
  config = withCASIOSLinkerFlags(config);
  return config;
};
