"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMULATION_PROFILES = void 0;
const platform_1 = require("./platform");
const isIOS = platform_1.Platform.OS === 'ios';
exports.SIMULATION_PROFILES = [
    {
        label: 'Clean device',
        device: {
            rooted: false,
            jailbroken: false,
            emulator: false,
            simulator: false,
            developerMode: false,
            usbDebugging: false,
        },
        runtime: {
            debuggerAttached: false,
            fridaDetected: false,
            xposedDetected: false,
            magiskDetected: false,
            hookDetected: false,
            suspiciousLibraries: [],
        },
        network: { vpn: false, proxy: false, dnsChanged: false, certificatePinned: true },
        integrity: {
            playIntegrity: true,
            appAttest: true,
            signatureValid: true,
            bundleHashValid: true,
        },
        privacy: {
            screenshotBlocked: true,
            screenRecording: false,
            overlayDetected: false,
        },
    },
    {
        label: 'Developer / emulator',
        device: {
            rooted: false,
            jailbroken: false,
            emulator: !isIOS,
            simulator: isIOS,
            developerMode: true,
            usbDebugging: !isIOS,
        },
        runtime: {
            debuggerAttached: true,
            fridaDetected: false,
            xposedDetected: false,
            magiskDetected: false,
            hookDetected: false,
            suspiciousLibraries: [],
        },
        network: { vpn: true, proxy: false, dnsChanged: false, certificatePinned: true },
        integrity: {
            playIntegrity: false,
            appAttest: false,
            signatureValid: true,
            bundleHashValid: true,
        },
        privacy: {
            screenshotBlocked: false,
            screenRecording: false,
            overlayDetected: false,
        },
    },
    {
        label: 'Compromised device',
        device: {
            rooted: !isIOS,
            jailbroken: isIOS,
            emulator: false,
            simulator: false,
            developerMode: true,
            usbDebugging: !isIOS,
        },
        runtime: {
            debuggerAttached: true,
            fridaDetected: true,
            xposedDetected: !isIOS,
            magiskDetected: !isIOS,
            hookDetected: true,
            suspiciousLibraries: isIOS
                ? ['MobileSubstrate.dylib']
                : ['frida-agent.so', 'libriru.so'],
        },
        network: { vpn: true, proxy: true, dnsChanged: true, certificatePinned: false },
        integrity: {
            playIntegrity: false,
            appAttest: false,
            signatureValid: false,
            bundleHashValid: false,
        },
        privacy: {
            screenshotBlocked: false,
            screenRecording: true,
            overlayDetected: true,
        },
    },
];
