import {
  ConfigPlugin,
  withSettingsGradle,
  withProjectBuildGradle,
  withAppBuildGradle,
} from '@expo/config-plugins';
import { type CASPluginParameters, CAS_VERSION } from './index';

const CAS_MEDIATION_REPOS = [
  {
    url: 'https://dl-maven-android.mintegral.com/repository/mbridge_android_sdk_oversea',
    content: ['com.mbridge.msdk.oversea'],
  },
  {
    url: 'https://artifact.bytedance.com/repository/pangle',
    content: ['com.pangle.global'],
  },
  {
    url: 'https://cboost.jfrog.io/artifactory/chartboost-ads/',
    content: ['com.chartboost', 'com.iab.omid.library'],
  },
  {
    url: 'https://ysonetwork.s3.eu-west-3.amazonaws.com/sdk/android',
    content: ['com.ysocorp'],
  },
  {
    url: 'https://maven.ogury.co',
    content: ['co.ogury', 'co.ogury.module'],
  },
  {
    url: 'https://s3.amazonaws.com/smaato-sdk-releases/',
    content: ['com.smaato.android.sdk'],
  },
  {
    url: 'https://verve.jfrog.io/artifactory/verve-gradle-release',
    content: ['net.pubnative', 'com.verve'],
  },
  {
    url: 'https://repo.pubmatic.com/artifactory/public-repos',
    content: ['com.pubmatic.sdk'],
  },
  {
    url: 'https://sdkpkg.sspnet.tech',
    content: ['sspnet.tech', 'sspnet.tech.adapters'],
  },
];

function withApplyPluginManagementRepos(settingsGradle: string) {
  const requiredLines = ['    gradlePluginPortal()', '    google()', '    mavenCentral()'];

  const hasPluginManagement = /(^|\n)\s*pluginManagement\s*\{/m.test(settingsGradle);

  const ensureLinesInsideRepos = (src: string, reposOpenRegex: RegExp) => {
    return src.replace(reposOpenRegex, m => {
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
      m => `${m}\n  repositories {\n${requiredLines.join('\n')}\n  }\n`,
    );
  }

  const header = ['pluginManagement {', '  repositories {', ...requiredLines, '  }', '}', ''].join(
    '\n',
  );

  return header + settingsGradle;
}

function withApplyCASClasspath(projectBuildGradle: string): string {
  const DEPENDENCY = 'com.cleveradssolutions:gradle-plugin:';
  const CLASSPATH_LINE = '        classpath("' + DEPENDENCY + CAS_VERSION + '")';
  let lines = projectBuildGradle.split('\n');
  let casClassPathIndex = lines.findLastIndex(line => line.includes(DEPENDENCY));

  if (casClassPathIndex > 0) {
    lines[casClassPathIndex] = CLASSPATH_LINE;
  } else {
    let lastClasspathIndex = lines.findLastIndex(line => line.includes(' classpath '));
    if (lastClasspathIndex > 0) {
      lines.splice(lastClasspathIndex + 1, 0, CLASSPATH_LINE);
    }
  }
  return lines.join('\n');
}

function withApplyCASMediationRepositories(projectBuildGradle: string): string {
  const START = '    // CAS Mediation repositories';
  if (projectBuildGradle.includes(START)) {
    return projectBuildGradle;
  }

  var repositories = CAS_MEDIATION_REPOS.map(({ url, content }) => {
    let groups = content.map(group => 'includeGroup("' + group + '")').join(' ');
    return [
      '    maven {',
      '      url = uri("' + url + '")',
      '      content { ' + groups + ' }',
      '    }',
    ].join('\n');
  }).join('\n');
  repositories = START + '\n' + repositories;

  const repoBlockRegex = /(allprojects\s*\{\s*repositories\s*\{)([\s\S]*?)(\n\s*\}\s*\})/;

  if (repoBlockRegex.test(projectBuildGradle)) {
    return projectBuildGradle.replace(repoBlockRegex, (_m, start, body, end) => {
      return start + body + repositories + '\n' + end;
    });
  }

  let block = [
    'allprojects {',
    '  repositories {',
    '    mavenCentral()',
    repositories,
    '  }',
    '}',
  ].join('\n');

  return projectBuildGradle.trimEnd() + '\n\n' + block + '\n';
}

function withApplyCASGradlePlugin(appBuildGradleLines: string[]): string[] {
  const DEPENDENCY = 'com.cleveradssolutions.gradle-plugin';
  let casPluginIncluded = appBuildGradleLines.some(line => line.includes(DEPENDENCY));
  if (casPluginIncluded) {
    return appBuildGradleLines;
  }

  if (appBuildGradleLines[0].startsWith('plugins')) {
    let closePluginsIndex = appBuildGradleLines.indexOf('}');
    const casPluginVersionLine = `    id("${DEPENDENCY}") version "${CAS_VERSION}"`;
    appBuildGradleLines.splice(closePluginsIndex, 0, casPluginVersionLine);
    return appBuildGradleLines;
  }

  const casPluginLine = `apply plugin: "${DEPENDENCY}"`;
  let lastPluginIndex = appBuildGradleLines.findLastIndex(line => line.startsWith('apply plugin:'));
  if (lastPluginIndex > 0) {
    appBuildGradleLines.splice(lastPluginIndex + 1, 0, casPluginLine);
  } else {
    appBuildGradleLines.push(casPluginLine);
  }

  return appBuildGradleLines;
}

function getAdapterNameForAndroid(adapter: string): string {
  switch (adapter) {
    case 'CASExchange':
      return 'casExchange';
    case 'DTExchange':
      return 'dtExchange';
    case 'PubMatic':
      return 'pubmatic';
    default:
      return adapter.charAt(0).toLowerCase() + adapter.slice(1);
  }
}

function withApplyCASPluginConfig(
  appBuildGradleLines: string[],
  props: CASPluginParameters,
): string[] {
  const CONFIG_START = '// CAS Plugin configuration';
  const CONFIG_END = '// End CAS Plugin configuration';

  const lines: string[] = [CONFIG_START];
  lines.push('');
  lines.push('// CAS Plugin configuration');
  lines.push('cas {');

  if (props.includeOptimalAds === true) {
    lines.push('    includeOptimalAds = true');
  }
  if (props.includeFamiliesAds === true) {
    lines.push('    includeFamiliesAds = true');
  }
  if (props.includeVPNCompliantAds === true) {
    lines.push('    includeVPNCompliantAds = true');
  }
  if (props.includeTenjinSDK === true) {
    lines.push('    includeTenjinSDK = true');
  }

  if (Array.isArray(props.adapters) && props.adapters.length) {
    lines.push('    adapters {');
    for (const adapter of props.adapters) {
      lines.push(`        ${getAdapterNameForAndroid(adapter)} = true`);
    }
    lines.push('    }');
  }

  if (props.useAdvertisingId === false) {
    lines.push(`    useAdvertisingId = false`);
  }
  lines.push('}');
  lines.push(CONFIG_END);

  const startIndex = appBuildGradleLines.indexOf(CONFIG_START);
  const endIndex = appBuildGradleLines.indexOf(CONFIG_END);
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    lines.splice(startIndex, endIndex - startIndex + 1, ...lines);
  } else {
    lines.push('');
    lines.push(...lines);
  }

  return lines;
}

export const withReactNativeCASMobileAdsAndroid: ConfigPlugin<CASPluginParameters> = (
  config,
  props,
) => {
  config = withSettingsGradle(config, config => {
    config.modResults.contents = withApplyPluginManagementRepos(config.modResults.contents);
    return config;
  });

  config = withProjectBuildGradle(config, config => {
    var content = config.modResults.contents;
    content = withApplyCASClasspath(content);
    content = withApplyCASMediationRepositories(content);
    config.modResults.contents = content;
    return config;
  });

  config = withAppBuildGradle(config, config => {
    var contentLines = config.modResults.contents.split('\n');
    contentLines = withApplyCASGradlePlugin(contentLines);
    contentLines = withApplyCASPluginConfig(contentLines, props);
    config.modResults.contents = contentLines.join('\n');
    return config;
  });

  return config;
};
