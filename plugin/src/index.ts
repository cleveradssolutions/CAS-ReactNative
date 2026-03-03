import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

import path from "path";
import { withCasAndroid } from "./withCasAndroid";
//yarnimport { withCasIos } from "./withCasIos";

export type CasSolution = "optimal" | "families";

export type CasExpoPluginProps = {
  //CAS App ID 
  casId?: string;

  //Enable one or more CAS solution packs
  solutions?: CasSolution[];

  //Enable any number of adapters
  adapters?: string[];

  //Advertising ID/IDFA toggle
  useAdvertisingId?: boolean;

  //NSUserTrackingUsageDescription text
  trackingDescription?: string;

  runCasConfig?: boolean;
};

//Default CAS version = npm package version
//eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(path.join(__dirname, "..", "..", "package.json"));

const withReactNativeCas: ConfigPlugin<CasExpoPluginProps | void> = (config, props) => {
  const p: CasExpoPluginProps = {
    casId: "demo",
    solutions: ["optimal"],
    adapters: [],
    useAdvertisingId: true,
    trackingDescription:
      "Your data will remain confidential and will only be used to provide you a better and personalised ad experience.",
    runCasConfig: true,
    ...(props ?? {}),
  };

  //Families must not use IDFA
  if (Array.isArray(p.solutions) && p.solutions.includes("families")) {
    p.useAdvertisingId = false;
  }

  config = withCasAndroid(config, p);
  //config = withCasIos(config, p);

  return config;
};

export default createRunOncePlugin(withReactNativeCas, pkg.name, pkg.version);