/**
 * Version of this configuration source.
 *
 * The source lives in the CAS-iOS-Internal repository, under `XCodeConfig`, and `build.mjs`
 * copies it into the React Native and Cordova plugins, which run it with their own Node, and
 * compiles it into a binary for everyone else. The version tells those copies apart: it is
 * printed on every run, and the stamp the Expo prebuild leaves carries it, so that a newer copy
 * knows the work has to be done again.
 *
 * Do not edit a copy. Edit this file and run `node build.mjs`.
 *
 * Raise it whenever the configuration changes what it writes.
 */
export const SCRIPT_VERSION = '1.0';
