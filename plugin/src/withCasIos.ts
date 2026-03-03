import { ConfigPlugin, withInfoPlist, withDangerousMod } from "@expo/config-plugins";
import type { CasExpoPluginProps, CasSolution } from "./index";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

//Default CAS version = npm package version
//eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("react-native-cas/package.json");
const CAS_VERSION: string = pkg.version;

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

function normalizeSolutions(props: CasExpoPluginProps): CasSolution[] {
  const s = Array.isArray(props.solutions) ? props.solutions.filter(Boolean) : [];
  return s.length ? s : ["optimal"];
}

function usesGoogleAds(props: CasExpoPluginProps): boolean {
  const solutions = normalizeSolutions(props);
  return solutions.includes("optimal") || (Array.isArray(props.adapters) && props.adapters.includes("googleAds"));
}

//Podfile
function withCasIosPodfile(config: any, props: CasExpoPluginProps) {
  return withDangerousMod(config, [
    "ios",
    async (c) => {
      const podfilePath = path.join(c.modRequest.platformProjectRoot, "Podfile");
      if (!fs.existsSync(podfilePath)) return c;

      let contents = fs.readFileSync(podfilePath, "utf8");

      // Add CAS Specs source on top
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
        const solutions = normalizeSolutions(props);

        const podLines: string[] = [];
        podLines.push("  # CAS Ads Mediation");

        // Solutions: can be enabled together
        if (solutions.includes("optimal")) {
          podLines.push(`  pod 'CleverAdsSolutions-SDK/Optimal', '${CAS_VERSION}'`);
        }
        if (solutions.includes("families")) {
          podLines.push(`  pod 'CleverAdsSolutions-SDK/Families', '${CAS_VERSION}'`);
        }

        // Adapters: can be enabled together with solutions
        if (Array.isArray(props.adapters) && props.adapters.length) {
          podLines.push("  # CAS Ads Mediation (Adapters)");
          for (const a of props.adapters) {
            const podName = ADAPTER_TO_IOS_POD[a];
            if (podName) podLines.push(`  pod '${podName}'`);
          }
        }

        if (contents.includes("use_expo_modules!")) {
          contents = contents.replace(
            /use_expo_modules!\s*\n/,
            (m) => `${m}\n${podLines.join("\n")}\n\n`
          );
        } else {
          contents = contents.replace(
            /target\s+['"][^'"]+['"]\s+do\s*\n/,
            (m) => `${m}\n${podLines.join("\n")}\n\n`
          );
        }
      }

      fs.writeFileSync(podfilePath, contents, "utf8");
      return c;
    },
  ]);
}

// casconfig.rb
function withCasConfigScript(config: any, props: CasExpoPluginProps) {
  if (props.runCasConfig === false) return config;

  return withDangerousMod(config, [
    "ios",
    async (c) => {
      const iosDir = c.modRequest.platformProjectRoot;

      const pkgRoot = path.dirname(require.resolve("react-native-cas/package.json"));

      // Support both layouts:
      // - old: src/plugin/casconfig.rb
      // - new: plugin/src/casconfig.rb
      const candidates = [
        path.join(pkgRoot, "plugin", "src", "casconfig.rb"),
        path.join(pkgRoot, "src", "plugin", "casconfig.rb"),
      ];

      const scriptSrc = candidates.find((p) => fs.existsSync(p));
      const scriptDst = path.join(iosDir, "casconfig.rb");

      if (!scriptSrc) {
        console.warn("[CAS][iOS] casconfig.rb not found in package, skipping.");
        return c;
      }

      fs.copyFileSync(scriptSrc, scriptDst);

      const casId = props.casId || "demo";
      const args: string[] = [casId];

      if (!usesGoogleAds(props)) {
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

// Info.plist
function withCasInfoPlist(config: any, props: CasExpoPluginProps) {
  return withInfoPlist(config, (c) => {
    const plist: any = c.modResults;

    if (!plist.NSUserTrackingUsageDescription && props.trackingDescription) {
      plist.NSUserTrackingUsageDescription = props.trackingDescription;
    } else if (!plist.NSUserTrackingUsageDescription) {
      plist.NSUserTrackingUsageDescription =
        "Your data will remain confidential and will only be used to provide you a better and personalised ad experience.";
    }

    // Keep current behavior: allow cleartext HTTP for ad networks
    plist.NSAppTransportSecurity = {
      ...(plist.NSAppTransportSecurity || {}),
      NSAllowsArbitraryLoads: true,
    };

    // Google Ads keys if Google Ads is used
    if (usesGoogleAds(props)) {
      if (!plist.GADApplicationIdentifier) {
        plist.GADApplicationIdentifier = "ca-app-pub-3940256099942544~1458002511";
      }
      plist.GADDelayAppMeasurementInit = true;
    }

    return c;
  });
}

export const withCasIos: ConfigPlugin<CasExpoPluginProps> = (config, props) => {
  config = withCasIosPodfile(config, props);
  config = withCasConfigScript(config, props);
  config = withCasInfoPlist(config, props);

  // Temporarily disabled (as requested)
  // config = withCasXcodeProject(config);

  return config;
};