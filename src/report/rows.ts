import {FullReport} from './generateReport';

interface Row {
  category: string;
  check: string;
  status: 'CLEAR' | 'FLAGGED';
  detail: string;
}

function baseRows(report: FullReport): Row[] {
  const {device, runtime, network, integrity, privacy} = report.base;
  const rows: Row[] = [];
  const add = (
    category: string,
    check: string,
    flagged: boolean,
    detail = '',
  ) =>
    rows.push({
      category,
      check,
      status: flagged ? 'FLAGGED' : 'CLEAR',
      detail,
    });

  add('Device', 'Rooted', device.rooted);
  add('Device', 'Jailbroken', device.jailbroken);
  add('Device', 'Emulator', device.emulator);
  add('Device', 'Simulator', device.simulator);
  add('Device', 'Developer mode', device.developerMode);
  add('Device', 'USB debugging', device.usbDebugging);

  add('Runtime', 'Debugger attached', runtime.debuggerAttached);
  add('Runtime', 'Frida', runtime.fridaDetected);
  add('Runtime', 'Xposed', runtime.xposedDetected);
  add('Runtime', 'Magisk', runtime.magiskDetected);
  add('Runtime', 'Runtime hooks', runtime.hookDetected);
  add(
    'Runtime',
    'Suspicious libraries',
    runtime.suspiciousLibraries.length > 0,
    runtime.suspiciousLibraries.join(' | '),
  );

  add('Network', 'VPN active', network.vpn);
  add('Network', 'Proxy configured', network.proxy);
  add('Network', 'DNS changed', network.dnsChanged);
  add('Network', 'Certificate pinning', !network.certificatePinned);

  add('Integrity', 'Play Integrity', !integrity.playIntegrity);
  add('Integrity', 'App Attest', !integrity.appAttest);
  add('Integrity', 'Signature valid', !integrity.signatureValid);
  add('Integrity', 'Bundle hash valid', !integrity.bundleHashValid);

  add('Privacy', 'Screenshot blocking', !privacy.screenshotBlocked);
  add('Privacy', 'Screen recording', privacy.screenRecording);
  add('Privacy', 'Overlay detected', privacy.overlayDetected);

  const ra = report.base.remoteAccess;
  add('RemoteAccess', 'Debugger attached', ra.debuggerAttached);
  add('RemoteAccess', 'Screen captured', ra.screenCaptured);
  add('RemoteAccess', 'Overlay detected', ra.overlayDetected);
  add('RemoteAccess', 'Accessibility risk', ra.accessibilityRisk);
  if (ra.remoteAccessApps.length === 0) {
    add('RemoteAccess', 'Remote-access apps', false);
  } else {
    for (const app of ra.remoteAccessApps) {
      add(
        'RemoteAccess',
        `RAT: ${app.name}`,
        app.installed || app.active,
        `${app.active ? 'active' : 'installed'}, confidence ${app.confidence}`,
      );
    }
  }

  return rows;
}

function providerRows(report: FullReport): Row[] {
  const rows: Row[] = [];
  for (const p of report.assessment.providers) {
    for (const s of p.signals) {
      rows.push({
        category: `Provider: ${p.name}${p.native ? '' : ' (simulated)'}`,
        check: s.label,
        status: s.flagged ? 'FLAGGED' : 'CLEAR',
        detail: s.detail ?? '',
      });
    }
  }
  return rows;
}

export function allRows(report: FullReport): Row[] {
  return [...baseRows(report), ...providerRows(report)];
}

export type {Row};
