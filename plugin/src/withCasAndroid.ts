import {
  ConfigPlugin,
  withSettingsGradle,
  withProjectBuildGradle,
  withAppBuildGradle,
} from "@expo/config-plugins";
import type { CasExpoPluginProps, CasSolution } from "./index";
import path from "path";

//Default CAS version = npm package version
//eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(path.join(__dirname, "..", "..", "package.json"));
const CAS_VERSION: string = pkg.version;

const CAS_ADAPTER_REPOS = [
  `    // CAS Ad Network Repositories`,
  `    maven { url 'https://dl-maven-android.mintegral.com/repository/mbridge_android_sdk_oversea' }`,
  `    maven { url 'https://artifact.bytedance.com/repository/pangle' }`,
  `    maven { url 'https://cboost.jfrog.io/artifactory/chartboost-ads/' }`,
  `    maven { url 'https://ysonetwork.s3.eu-west-3.amazonaws.com/sdk/android' }`,
  `    maven { url 'https://maven.ogury.co' }`,
  `    maven { url 'https://aa-sdk.s3-eu-west-1.amazonaws.com/android_repo' }`,
  `    maven { url 'https://s3.amazonaws.com/smaato-sdk-releases/' }`,
  `    maven { url 'https://verve.jfrog.io/artifactory/verve-gradle-release' }`,
  `    maven { url 'https://repo.pubmatic.com/artifactory/public-repos' }`,
  `    maven { url 'https://sdkpkg.sspnet.tech' }`,
].join("\n");

function normalizeSolutions(props: CasExpoPluginProps): CasSolution[] {
  const s = Array.isArray(props.solutions) ? props.solutions.filter(Boolean) : [];
  return s.length ? s : ["optimal"];
}

//Ensure pluginManagement repositories contains gradlePluginPortal/google/mavenCentral
function ensurePluginManagementRepos(settingsGradle: string) {
  const requiredLines = ["    gradlePluginPortal()", "    google()", "    mavenCentral()"];

  const hasPluginManagement = /(^|\n)\s*pluginManagement\s*\{/m.test(settingsGradle);

  const ensureLinesInsideRepos = (src: string, reposOpenRegex: RegExp) => {
    return src.replace(reposOpenRegex, (m) => {
      let out = m;
      for (const line of requiredLines) {
        if (!out.includes(line)) out += `\n${line}`;
      }
      return out;
    });
  };

  if (hasPluginManagement) {
    const pmWithRepos = /(pluginManagement\s*\{[\s\S]*?repositories\s*\{)/m;
    if (pmWithRepos.test(settingsGradle)) {
      return ensureLinesInsideRepos(settingsGradle, pmWithRepos);
    }

    return settingsGradle.replace(
      /(pluginManagement\s*\{)/m,
      (m) => `${m}\n  repositories {\n${requiredLines.join("\n")}\n  }\n`
    );
  }

  const header = ["pluginManagement {", "  repositories {", ...requiredLines, "  }", "}", ""].join(
    "\n"
  );

  return header + settingsGradle;
}

//Add ad-network Maven repositories to allprojects.repositories
function ensureAllprojectsRepositories(projectBuildGradle: string) {
  if (projectBuildGradle.includes("CAS Ad Network Repositories")) return projectBuildGradle;

  const allprojectsRepoBlock =
    /(allprojects\s*\{\s*repositories\s*\{)([\s\S]*?)(\n\s*\}\s*\}\s*)/m;

  if (allprojectsRepoBlock.test(projectBuildGradle)) {
    return projectBuildGradle.replace(allprojectsRepoBlock, (_m, start, middle, end) => {
      return `${start}\n${CAS_ADAPTER_REPOS}\n${middle}${end}`;
    });
  }

  const snippet = `
allprojects {
  repositories {
    mavenCentral()
${CAS_ADAPTER_REPOS}
  }
}
`.trim();

  return projectBuildGradle.trimEnd() + "\n\n" + snippet + "\n";
}

//Ensure CAS Gradle plugin is applied using plugins { id(...) version "..." }
function ensureCasPluginsDsl(appBuildGradle: string) {
  if (appBuildGradle.includes("com.cleveradssolutions.gradle-plugin")) return appBuildGradle;

  //If file already has plugins { }, inject CAS plugin line after com.android.application if possible
  const pluginsBlockOpen = /(^|\n)\s*plugins\s*\{\s*\n/m;
  if (pluginsBlockOpen.test(appBuildGradle)) {
    //Try to insert after android application plugin line
    const androidPluginLine =
      /(plugins\s*\{[\s\S]*?id\s*\(\s*["']com\.android\.application["']\s*\)[\s\S]*?\n)/m;

    const casLine = `    id("com.cleveradssolutions.gradle-plugin") version "${CAS_VERSION}"\n`;

    if (androidPluginLine.test(appBuildGradle)) {
      return appBuildGradle.replace(androidPluginLine, (m) => {
        //Avoid double insert
        if (m.includes("com.cleveradssolutions.gradle-plugin")) return m;
        return m + casLine;
      });
    }

    //insert at the beginning of plugins block
    return appBuildGradle.replace(pluginsBlockOpen, (m) => `${m}${casLine}`);
  }

  //Otherwise convert common Expo/RN "apply plugin" style into plugins { } style
  const applyAndroid = `apply plugin: "com.android.application"`;
  const applyKotlin = `apply plugin: "org.jetbrains.kotlin.android"`;
  const applyReact = `apply plugin: "com.facebook.react"`;

  const hasAllApplies =
    appBuildGradle.includes(applyAndroid) &&
    appBuildGradle.includes(applyKotlin) &&
    appBuildGradle.includes(applyReact);

  if (hasAllApplies) {
    const pluginsDsl = [
      "plugins {",
      '    id("com.android.application")',
      '    id("org.jetbrains.kotlin.android")',
      '    id("com.facebook.react")',
      `    id("com.cleveradssolutions.gradle-plugin") version "${CAS_VERSION}"`,
      "}",
    ].join("\n");

    return appBuildGradle
      .replace(
        `${applyAndroid}\n${applyKotlin}\n${applyReact}`,
        pluginsDsl
      )
      .trimStart();
  }

  const header = [
    "plugins {",
    `    id("com.cleveradssolutions.gradle-plugin") version "${CAS_VERSION}"`,
    "}",
    "",
  ].join("\n");

  return header + appBuildGradle;
}

function ensureCasConfigBlock(appBuildGradle: string, props: CasExpoPluginProps) {
  if (appBuildGradle.includes("\ncas {")) return appBuildGradle;

  const solutions = normalizeSolutions(props);
  const includeOptimal = solutions.includes("optimal");
  const includeFamilies = solutions.includes("families");

  const useAdvertisingId =
    includeFamilies ? false : props.useAdvertisingId !== false;

  const lines: string[] = [];
  lines.push("");
  lines.push("// CAS Ads configuration (added by react-native-cas Expo config plugin)");
  lines.push("cas {");

  //Solutions 
  if (includeOptimal) lines.push("    includeOptimalAds = true");
  if (includeFamilies) lines.push("    includeFamiliesAds = true");

  //If no solution explicitly enabled 
  if (!includeOptimal && !includeFamilies) {
    lines.push("    includeOptimalAds = true");
  }

  //Adapters
  if (Array.isArray(props.adapters) && props.adapters.length) {
    lines.push("    adapters {");
    for (const a of props.adapters) {
      lines.push(`        ${a} = true`);
    }
    lines.push("    }");
  }

  lines.push(`    useAdvertisingId = ${useAdvertisingId}`);
  lines.push("}");
  lines.push("");

  return appBuildGradle.trimEnd() + "\n" + lines.join("\n");
}

export const withCasAndroid: ConfigPlugin<CasExpoPluginProps> = (config, props) => {
  //settings.gradle
  config = withSettingsGradle(config, (c) => {
    c.modResults.contents = ensurePluginManagementRepos(c.modResults.contents);
    return c;
  });

  //add only ad-network repositories 
  config = withProjectBuildGradle(config, (c) => {
    let s = c.modResults.contents;
    s = ensureAllprojectsRepositories(s);
    c.modResults.contents = s;
    return c;
  });

  config = withAppBuildGradle(config, (c) => {
    let s = c.modResults.contents;
    s = ensureCasPluginsDsl(s);
    s = ensureCasConfigBlock(s, props);
    c.modResults.contents = s;
    return c;
  });

  return config;
};