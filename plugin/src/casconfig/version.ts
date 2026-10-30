/**
 * Version of this configuration source.
 *
 * The source lives in CAS-iOS-Internal and is copied into the React Native and Cordova plugins,
 * which run it with their own Node, and compiled into a binary for everyone else. The version
 * tells those copies apart: it is printed on every run, and the stamp the Expo prebuild leaves
 * carries it so that a newer copy knows the work has to be done again.
 *
 * Raise it whenever the configuration changes what it writes.
 */
export const SCRIPT_VERSION = '1.0';
