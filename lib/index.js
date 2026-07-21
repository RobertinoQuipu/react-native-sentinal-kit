"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMULATION_PROFILES = exports.ThreatScore = exports.HttpError = exports.httpJson = exports.resetConfig = exports.getConfig = exports.configure = exports.hasLiveSignals = exports.collectLiveReport = exports.isNativeModuleAvailable = exports.SecurityKit = exports.default = void 0;
var SecurityKit_1 = require("./SecurityKit");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(SecurityKit_1).default; } });
var SecurityKit_2 = require("./SecurityKit");
Object.defineProperty(exports, "SecurityKit", { enumerable: true, get: function () { return __importDefault(SecurityKit_2).default; } });
Object.defineProperty(exports, "isNativeModuleAvailable", { enumerable: true, get: function () { return SecurityKit_2.isNativeModuleAvailable; } });
var deviceCollector_1 = require("./deviceCollector");
Object.defineProperty(exports, "collectLiveReport", { enumerable: true, get: function () { return deviceCollector_1.collectLiveReport; } });
Object.defineProperty(exports, "hasLiveSignals", { enumerable: true, get: function () { return deviceCollector_1.hasLiveSignals; } });
var config_1 = require("./config");
Object.defineProperty(exports, "configure", { enumerable: true, get: function () { return config_1.configure; } });
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return config_1.getConfig; } });
Object.defineProperty(exports, "resetConfig", { enumerable: true, get: function () { return config_1.resetConfig; } });
var http_1 = require("./net/http");
Object.defineProperty(exports, "httpJson", { enumerable: true, get: function () { return http_1.httpJson; } });
Object.defineProperty(exports, "HttpError", { enumerable: true, get: function () { return http_1.HttpError; } });
var ThreatScore_1 = require("./ThreatScore");
Object.defineProperty(exports, "ThreatScore", { enumerable: true, get: function () { return ThreatScore_1.ThreatScore; } });
var simulation_1 = require("./simulation");
Object.defineProperty(exports, "SIMULATION_PROFILES", { enumerable: true, get: function () { return simulation_1.SIMULATION_PROFILES; } });
__exportStar(require("./providers"), exports);
__exportStar(require("./report"), exports);
__exportStar(require("./types"), exports);
