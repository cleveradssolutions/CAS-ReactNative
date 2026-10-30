module.exports = {
  dependency: {
    platforms: {
      ios: {
        scriptPhases: [
          {
            name: '[CAS.AI] Configuration',
            // `.xcode.env` is where React Native keeps NODE_BINARY, because a build phase
            // inherits none of the PATH a shell would have.
            script:
              'if [ -f "$SRCROOT/.xcode.env" ]; then source "$SRCROOT/.xcode.env"; fi\n' +
              'if [ -f "$SRCROOT/.xcode.env.local" ]; then source "$SRCROOT/.xcode.env.local"; fi\n' +
              '"${NODE_BINARY:-node}" "$SRCROOT/../node_modules/react-native-cas/plugin/build/casconfig/cli.js"\n',
            shell_path: '/bin/sh',
            execution_position: 'before_compile',
            always_out_of_date: '1',
            show_env_vars_in_log: '0',
          },
        ],
      },
      android: {},
    },
  },
  assets: [],
};
