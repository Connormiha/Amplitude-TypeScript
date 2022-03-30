import {
  Event,
  Config as IConfig,
  Logger as ILogger,
  InitOptions,
  LogLevel,
  Storage,
  Transport,
  Plugin,
  ServerZone,
} from '@amplitude/analytics-types';

import { Logger } from './logger';

const DEFAULT_INSTANCE = 'default';
const instances: Record<string, IConfig> = {};

const AMPLITUDE_SERVER_URL = 'https://api2.amplitude.com/2/httpapi';
const EU_AMPLITUDE_SERVER_URL = 'https://api.eu.amplitude.com/2/httpapi';
const AMPLITUDE_BATCH_SERVER_URL = 'https://api2.amplitude.com/batch';
const EU_AMPLITUDE_BATCH_SERVER_URL = 'https://api.eu.amplitude.com/batch';

export const serverUrls = {
  [ServerZone.US]: (useBatch: boolean) => (useBatch ? AMPLITUDE_BATCH_SERVER_URL : AMPLITUDE_SERVER_URL),
  [ServerZone.EU]: (useBatch: boolean) => (useBatch ? EU_AMPLITUDE_BATCH_SERVER_URL : EU_AMPLITUDE_SERVER_URL),
};

export const defaultConfig = {
  flushMaxRetries: 5,
  flushQueueSize: 10,
  flushIntervalMillis: 1000,
  logLevel: LogLevel.Warn,
  loggerProvider: new Logger(),
  saveEvents: true,
  optOut: false,
  serverUrl: AMPLITUDE_SERVER_URL,
  serverZone: ServerZone.US,
  useBatch: false,
};

export class Config implements IConfig {
  apiKey: string;
  userId?: string;
  deviceId?: string;
  sessionId?: number;
  flushIntervalMillis: number;
  flushMaxRetries: number;
  flushQueueSize: number;
  loggerProvider: ILogger;
  logLevel: LogLevel;
  partnerId?: string;
  plugins: Plugin[];
  optOut: boolean;
  saveEvents: boolean;
  serverUrl: string | undefined;
  serverZone: ServerZone;
  transportProvider: Transport;
  storageProvider: Storage<Event[]>;
  useBatch: boolean;

  constructor(options: InitOptions<IConfig>) {
    this.apiKey = options.apiKey;
    this.userId = options.userId;
    this.deviceId = options.deviceId;
    this.sessionId = options.sessionId;
    this.flushIntervalMillis = options.flushIntervalMillis || defaultConfig.flushIntervalMillis;
    this.flushMaxRetries = options.flushMaxRetries || defaultConfig.flushMaxRetries;
    this.flushQueueSize = options.flushQueueSize || defaultConfig.flushQueueSize;
    this.loggerProvider = options.loggerProvider || defaultConfig.loggerProvider;
    this.logLevel = options.logLevel || defaultConfig.logLevel;
    this.partnerId = options.partnerId;
    this.plugins = [];
    this.optOut = options.optOut ?? defaultConfig.optOut;
    this.saveEvents = options.saveEvents ?? defaultConfig.saveEvents;
    this.serverUrl = options.serverUrl;
    this.serverZone = options.serverZone || defaultConfig.serverZone;
    this.storageProvider = options.storageProvider;
    this.transportProvider = options.transportProvider;
    this.useBatch = options.useBatch ?? defaultConfig.useBatch;

    this.loggerProvider.enable(this.logLevel);
  }
}

export const createConfig = (config: Config) => {
  // If config for an instance already exists, perform Object.assign() to reuse reference
  // to config object. This is useful when config object reference is used in plugins
  instances[DEFAULT_INSTANCE] = instances[DEFAULT_INSTANCE]
    ? Object.assign(instances[DEFAULT_INSTANCE], config)
    : config;
  return instances[DEFAULT_INSTANCE];
};

export const getConfig = () => {
  return instances[DEFAULT_INSTANCE];
};

export const resetInstances = () => {
  for (const name in instances) {
    delete instances[name];
  }
};
