import {
  ConfigPlugin,
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
} from "@expo/config-plugins";
import type { CasExpoPluginProps } from "./index";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

//iOS pod mapping
const ADAPTER_TO_IOS_POD: Record<string, string> = {
  appLovin: "CASMediationAppLovin",
  audienceNetwork: "CASMediationAudienceNetwork",
  bigoAds: "CASMediationBigo",
  casExchange: "CASMediationCASExchange",
  chartboost: "CASMediationChartboost",
  crossPromo: "CASMediationCrossPromo",
  dtExchange: "CASMediationDTExchange",
  googleAds: "CASMediationGoogleAds",
  hyprMX: "CASMediationHyprMX",
  inMobi: "CASMediationInMobi",
  ironSource: "CASMediationIronSource",
  kidoz: "CASMediationKidoz",
  liftoffMonetize: "CASMediationLiftoffMonetize",
  madex: "CASMediationMadex",
  maticoo: "CASMediationMaticoo",
  mintegral: "CASMediationMintegral",
  ogury: "CASMediationOgury",
  pangle: "CASMediationPangle",
  prado: "CASMediationPrado",
  pubmatic: "CASMediationPubMatic",
  smaato: "CASMediationSmaato",
  startIO: "CASMediationStartIO",
  superAwesome: "CASMediationSuperAwesome",
  unityAds: "CASMediationUnityAds",
  verve: "CASMediationVerve",
  yangoAds: "CASMediationYangoAds",
  ysoNetwork: "CASMediationYsoNetwork",
};

function hasGoogleAds(props: CasExpoPluginProps) {
  if (!props.adSolution || props.adSolution === "optimal") return true;
  if (props.adSolution === "families") return false;
  return Array.isArray(props.adapters) && props.adapters.includes("googleAds");
}

 //Podfile
function withCasIosPodfile(config: any, props: CasExpoPluginProps) {
  return withDangerousMod(config, [
    "ios",
    async (c) => {
      const podfilePath = path.join(c.modRequest.platformProjectRoot, "Podfile");
      if (!fs.existsSync(podfilePath)) return c;

      let contents = fs.readFileSync(podfilePath, "utf8");

      //Add CAS Specs source on top
      if (!contents.includes("CAS-Specs.git")) {
        const sources = [
          "source 'https://github.com/CocoaPods/Specs.git'",
          "source 'https://github.com/cleveradssolutions/CAS-Specs.git'",
          "",
        ].join("\n");
        contents = sources + contents;
      }

      //Add CAS pods once
      if (!contents.includes("CAS Ads Mediation")) {
        const ver = props.casVersion || "4.6.2";
        let podLines: string[] = [];

        if (props.adSolution === "choice" && props.adapters && props.adapters.length) {
          podLines.push("  # CAS Ads Mediation (Choice networks)");
          for (const a of props.adapters) {
            const podName = ADAPTER_TO_IOS_POD[a];
            if (podName) podLines.push(`  pod '${podName}'`);
          }
        } else if (props.adSolution === "families") {
          podLines = [
            "  # CAS Ads Mediation",
            `  pod 'CleverAdsSolutions-SDK/Families', '${ver}'`,
          ];
        } else {
          podLines = [
            "  # CAS Ads Mediation",
            `  pod 'CleverAdsSolutions-SDK/Optimal', '${ver}'`,
          ];
        }

        if (contents.includes("use_expo_modules!")) {
          contents = contents.replace(/use_expo_modules!\s*\n/, (m) => `${m}\n${podLines.join("\n")}\n\n`);
        } else {
          contents = contents.replace(/target\s+['"][^'"]+['"]\s+do\s*\n/, (m) => `${m}\n${podLines.join("\n")}\n\n`);
        }
      }

      fs.writeFileSync(podfilePath, contents, "utf8");
      return c;
    },
  ]);
}

 //casconfig.rb
function withCasConfigScript(config: any, props: CasExpoPluginProps) {
  return withDangerousMod(config, [
    "ios",
    async (c) => {
      const iosDir = c.modRequest.platformProjectRoot;

      const pkgRoot = path.dirname(require.resolve("react-native-cas/package.json"));
      const scriptSrc = path.join(pkgRoot, "src", "plugin", "casconfig.rb");
      const scriptDst = path.join(iosDir, "casconfig.rb");

      if (!fs.existsSync(scriptSrc)) {
        console.warn("[CAS][iOS] casconfig.rb not found in package, skipping.");
        return c;
      }

      fs.copyFileSync(scriptSrc, scriptDst);

      const casId = props.casId || "demo";
      const args: string[] = [casId];

      if (!hasGoogleAds(props)) {
        args.push("--no-gad");
      }

      try {
        console.log(`[CAS][iOS] Running casconfig.rb ${args.join(" ")}`);
        execSync(`ruby casconfig.rb ${args.join(" ")}`, {
          cwd: iosDir,
          stdio: "inherit",
        });
        console.log("[CAS][iOS] casconfig.rb completed.");
      } catch (e: any) {
        console.warn(`[CAS][iOS] casconfig.rb failed: ${e?.message ?? e}`);
        console.warn("[CAS][iOS] Install xcodeproj gem if needed: gem install xcodeproj");
        console.warn("[CAS][iOS] Continuing with plugin-only configuration...");
      }

      return c;
    },
  ]);
}

 //Info.plist:
function withCasInfoPlist(config: any, props: CasExpoPluginProps) {
  return withInfoPlist(config, (c) => {
    const plist: any = c.modResults;

    if (!plist.NSUserTrackingUsageDescription && props.trackingDescription) {
      plist.NSUserTrackingUsageDescription = props.trackingDescription;
    } else if (!plist.NSUserTrackingUsageDescription) {
      plist.NSUserTrackingUsageDescription =
        "Your data will remain confidential and will only be used to provide you a better and personalised ad experience.";
    }

    plist.NSAppTransportSecurity = {
      ...(plist.NSAppTransportSecurity || {}),
      NSAllowsArbitraryLoads: true,
    };

    if (hasGoogleAds(props)) {
      if (!plist.GADApplicationIdentifier) {
        plist.GADApplicationIdentifier = "ca-app-pub-3940256099942544~1458002511";
      }
      plist.GADDelayAppMeasurementInit = true;
    }

    return c;
  });
}

//Xcode build settings
function withCasXcodeProject(config: any) {
  return withXcodeProject(config, (c) => {
    const project: any = c.modResults;
    const targets = project.pbxNativeTargetSection();

    const hasFlag = (flags: any[], flag: string) =>
      flags.some((f) => f === flag || f === `"${flag}"`);

    for (const key in targets) {
      const target = targets[key];
      if (typeof target !== "object" || !target.buildConfigurationList) continue;

      const configList = project.pbxXCConfigurationList()[target.buildConfigurationList];
      if (!configList) continue;

      for (const buildConfig of configList.buildConfigurations) {
        const cfg = project.pbxXCBuildConfigurationSection()[buildConfig.value];
        if (!cfg || !cfg.buildSettings) continue;

        let flags = cfg.buildSettings.OTHER_LDFLAGS || [];
        if (typeof flags === "string") flags = [flags];

        let modified = false;
        if (!hasFlag(flags, "$(inherited)")) {
          flags.unshift('"$(inherited)"');
          modified = true;
        }
        if (!hasFlag(flags, "-ObjC")) {
          flags.push('"-ObjC"');
          modified = true;
        }
        if (modified) cfg.buildSettings.OTHER_LDFLAGS = flags;
      }
    }

    return c;
  });
}

export const withCasIos: ConfigPlugin<CasExpoPluginProps> = (config, props) => {
  config = withCasIosPodfile(config, props);
  config = withCasConfigScript(config, props);
  config = withCasInfoPlist(config, props);
  config = withCasXcodeProject(config);
  return config;
};
