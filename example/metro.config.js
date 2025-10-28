const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const libPak = require('../package.json');

const root = path.resolve(__dirname, '..');
const peerModules = Object.keys({ ...(libPak.peerDependencies || {}) });

/** @type {import('metro-config').MetroConfig} */
const config = {
  projectRoot: __dirname,
  watchFolders: [root],
  resolver: {
    blacklistRE: exclusionList(
      peerModules.map(m => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)),
    ),
    extraNodeModules: {
      'react-native-cas': root,
      ...peerModules.reduce((acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      }, {}),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
