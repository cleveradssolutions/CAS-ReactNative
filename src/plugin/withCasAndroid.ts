import {
  ConfigPlugin,
  withSettingsGradle,
  withProjectBuildGradle,
  withAppBuildGradle,
} from "@expo/config-plugins";
import type { CasExpoPluginProps } from "./index";

const CAS_ADAPTER_REPOS = [
  `    // CAS Ad Network Repositories`,
  `    maven { url 'https://sdk.cleveradssolutions.com/android/' }`,
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

function ensurePluginManagementRepos(settingsGradle: string) {
  //If gradlePluginPortal already exists, do nothing

  const requiredLines = [
    "    gradlePluginPortal()",
    "    google()",
    "    mavenCentral()",
    "    maven { url 'https://sdk.cleveradssolutions.com/android/' }",
  ];

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
    //If there are repositories { ... } inside pluginManagement
    const pmWithRepos = /(pluginManagement\s*\{[\s\S]*?repositories\s*\{)/m;
    if (pmWithRepos.test(settingsGradle)) {
      return ensureLinesInsideRepos(settingsGradle, pmWithRepos);
    }

    //If pluginManagement is present, but repositories are not present
    return settingsGradle.replace(
      /(pluginManagement\s*\{)/m,
      (m) =>
        `${m}\n  repositories {\n${requiredLines.join("\n")}\n  }\n`
    );
  }

  //If pluginManagement is not present, add it from above.
  const header = [
    "pluginManagement {",
    "  repositories {",
    ...requiredLines,
    "  }",
    "}",
    "",
  ].join("\n");

  return header + settingsGradle;
}

function ensureAllprojectsRepositories(projectBuildGradle: string) {
  if (projectBuildGradle.includes("CAS Ad Network Repositories")) return projectBuildGradle;

  const allprojectsRepoBlock =
    /(allprojects\s*\{\s*repositories\s*\{)([\s\S]*?)(\n\s*\}\s*\}\s*)/m;

  if (allprojectsRepoBlock.test(projectBuildGradle)) {
    return projectBuildGradle.replace(allprojectsRepoBlock, (_m, start, middle, end) => {
      return `${start}\n${CAS_ADAPTER_REPOS}\n${middle}${end}`;
    });
  }

  //add allprojects block
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

/**
* make sure Gradle can find the plugin:
* add classpath("com.cleveradssolutions:gradle-plugin:<version>")
* to buildscript.dependencies (project-level android/build.gradle)
*/
function ensureCasClasspath(projectBuildGradle: string, casVersion: string) {
  const marker = "com.cleveradssolutions:gradle-plugin";
  if (projectBuildGradle.includes(marker)) return projectBuildGradle;

  const classpathLine = `        classpath("com.cleveradssolutions:gradle-plugin:${casVersion}")`;

  //make sure buildscript.repositories includes CAS maven 
  const bsReposOpen = /(buildscript\s*\{[\s\S]*?repositories\s*\{)/m;
  if (bsReposOpen.test(projectBuildGradle)) {
    projectBuildGradle = projectBuildGradle.replace(bsReposOpen, (m) => {
      let out = m;
      if (!out.includes("google()")) out += `\n    google()`;
      if (!out.includes("mavenCentral()")) out += `\n    mavenCentral()`;
      if (!out.includes("https://sdk.cleveradssolutions.com/android/")) {
        out += `\n    maven { url 'https://sdk.cleveradssolutions.com/android/' }`;
      }
      return out;
    });
  }

  //if buildscript { dependencies { ... } } add into dependencies
  const depsBlock = /(buildscript\s*\{[\s\S]*?dependencies\s*\{)/m;
  if (depsBlock.test(projectBuildGradle)) {
    return projectBuildGradle.replace(depsBlock, (m) => `${m}\n${classpathLine}`);
  }

  //if buildscript empty — add in top
  const header = `
buildscript {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://sdk.cleveradssolutions.com/android/' }
  }
  dependencies {
${classpathLine}
  }
}

`.trim();

  return header + "\n" + projectBuildGradle;
}

function ensureCasApplyPlugin(appBuildGradle: string) {
  if (appBuildGradle.includes("com.cleveradssolutions.gradle-plugin")) return appBuildGradle;

  //Expo/RN android/app/build.gradle: groovy + apply plugin: "com.android.application"
  const anchor = `apply plugin: "com.android.application"`;
  if (appBuildGradle.includes(anchor)) {
    return appBuildGradle.replace(
      anchor,
      `${anchor}\napply plugin: "com.cleveradssolutions.gradle-plugin"`
    );
  }

  return `apply plugin: "com.cleveradssolutions.gradle-plugin"\n` + appBuildGradle;
}

function ensureCasConfigBlock(appBuildGradle: string, props: CasExpoPluginProps) {
  if (appBuildGradle.includes("\ncas {")) return appBuildGradle;

  const useAdvertisingId =
    props.adSolution === "families" ? false : props.useAdvertisingId !== false;

  const lines: string[] = [];
  lines.push("");
  lines.push("// CAS Ads configuration (added by react-native-cas Expo config plugin)");
  lines.push("cas {");

  if (props.adSolution === "choice" && props.adapters && props.adapters.length) {
    lines.push("    adapters {");
    for (const a of props.adapters) {
      lines.push(`        ${a} = true`);
    }
    lines.push("    }");
  } else if (props.adSolution === "families") {
    lines.push("    includeFamiliesAds = true");
  } else {
    lines.push("    includeOptimalAds = true");
  }

  lines.push(`    useAdvertisingId = ${useAdvertisingId}`);
  lines.push("}");
  lines.push("");

  return appBuildGradle.trimEnd() + "\n" + lines.join("\n");
}

export const withCasAndroid: ConfigPlugin<CasExpoPluginProps> = (config, props) => {
  const casVersion = props.casVersion || "4.6.2";

  //settings.gradle
  config = withSettingsGradle(config, (c) => {
    c.modResults.contents = ensurePluginManagementRepos(c.modResults.contents);
    return c;
  });

  //android/build.gradle: repos + classpath
  config = withProjectBuildGradle(config, (c) => {
    let s = c.modResults.contents;
    s = ensureAllprojectsRepositories(s);
    s = ensureCasClasspath(s, casVersion);
    c.modResults.contents = s;
    return c;
  });

  //android/app/build.gradle: apply plugin + cas
  config = withAppBuildGradle(config, (c) => {
    let s = c.modResults.contents;
    s = ensureCasApplyPlugin(s);
    s = ensureCasConfigBlock(s, props);
    c.modResults.contents = s;
    return c;
  });

  return config;
};
