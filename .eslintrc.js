module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  settings: {
    react: {
      version: '16.1.0',
    },
  },
  env: {
    node: true,
  },
  rules: {
    'eslint-comments/no-unlimited-disable': 0,
    'no-new': 0,
    'no-continue': 0,
    'no-extend-native': 0,
    'import/no-dynamic-require': 0,
    'global-require': 'off',
    'class-methods-use-this': 0,
    'no-console': 1,
    'no-plusplus': 0,
    'no-undef': 'error',
    'no-shadow': 0,
    'no-console': 0,
    'no-catch-shadow': 0,
    'no-underscore-dangle': 'off',
    'no-use-before-define': 0,
    'import/no-unresolved': 0,
    'no-empty-description': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off', // keep it professional when you use them though please
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
  globals: {
    __DEV__: true,
    console: true,
    should: true,
    Utils: true,
    window: true,
  },
};
