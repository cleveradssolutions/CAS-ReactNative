module.exports = {
  dependency: {
    platforms: {
      ios: {
        scriptPhases: [
          {
            name: '[CAS.AI] Configuration',
            path: './plugin/casconfig.rb',
            shell_path: '/usr/bin/ruby',
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
