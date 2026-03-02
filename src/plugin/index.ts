import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import { withCasAndroid } from "./withCasAndroid";
import { withCasIos } from "./withCasIos";

export type CasExpoPluginProps = {
  //CAS App ID 
  casId?: string;
  adSolution?: "optimal" | "families" | "choice";

  // Used only for "choice" solution
  adapters?: string[];

  //Advertising ID / IDFA toggle 
  useAdvertisingId?: boolean;

  //CAS version for Android Gradle plugin and iOS pods
  casVersion?: string;

  //NSUserTrackingUsageDescription text
  trackingDescription?: string;

  //GADApplicationIdentifier 
  googleAppId?: string;

  //NSAllowsArbitraryLoads
  allowArbitraryLoads?: boolean;

  runCasConfig?: boolean;
};

//Default CAS version = npm package version
//eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("react-native-cas/package.json");

const withReactNativeCas: ConfigPlugin<CasExpoPluginProps | void> = (config, props) => {
  const p: CasExpoPluginProps = {
    casId: "demo",
    adSolution: "optimal",
    adapters: [],
    casVersion: pkg.version,
    useAdvertisingId: true,
    trackingDescription:
      "Your data will remain confidential and will only be used to provide you a better and personalised ad experience.",
    allowArbitraryLoads: false,
    runCasConfig: true,
    ...(props ?? {}),
  };

  //Families must not use IDFA
  if (p.adSolution === "families") {
    p.useAdvertisingId = false;
  }

  config = withCasAndroid(config, p);
  config = withCasIos(config, p);

  return config;
};

export default createRunOncePlugin(withReactNativeCas, pkg.name, pkg.version);