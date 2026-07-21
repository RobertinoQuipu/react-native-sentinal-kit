/**
 * Platform shim.
 *
 * This package is designed to run in two environments:
 *   1. Inside a React Native app (where `react-native` provides NativeModules
 *      and Platform, and the real native security SDKs may be linked).
 *   2. As a local Node CLI that generates a report file (no react-native).
 *
 * We resolve `react-native` lazily so importing the package in Node does not
 * throw. When it is unavailable we fall back to safe stubs, which drives the
 * built-in JS simulation engine.
 */

interface PlatformLike {
  OS: string;
  select<T>(spec: {ios?: T; android?: T; default?: T}): T | undefined;
}

interface RNShim {
  NativeModules: Record<string, any>;
  Platform: PlatformLike;
}

function load(): RNShim {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rn = require('react-native');
    if (rn && rn.Platform) {
      return {NativeModules: rn.NativeModules ?? {}, Platform: rn.Platform};
    }
  } catch {
    // not in a react-native environment
  }

  const os = process?.platform === 'darwin' ? 'node-macos' : 'node';
  const Platform: PlatformLike = {
    OS: os,
    select: spec => spec.default,
  };
  return {NativeModules: {}, Platform};
}

const shim = load();

export const NativeModules = shim.NativeModules;
export const Platform = shim.Platform;

/** True in development. Safe in both React Native (__DEV__) and Node. */
export function isDev(): boolean {
  return typeof __DEV__ !== 'undefined'
    ? !!__DEV__
    : process?.env?.NODE_ENV !== 'production';
}
