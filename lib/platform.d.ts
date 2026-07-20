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
    select<T>(spec: {
        ios?: T;
        android?: T;
        default?: T;
    }): T | undefined;
}
export declare const NativeModules: Record<string, any>;
export declare const Platform: PlatformLike;
export {};
