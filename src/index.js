import * as common from 'ldclient-js-common';
import * as winston from 'winston';
import nodePlatform from './nodePlatform';

// This creates a client-side SDK instance to be used in Node.
export function initialize(env, user, options = {}) {
  // Pass our platform object to the common code to create the Node version of the client
  const platform = nodePlatform(options);
  const extraDefaults = {};
  if (!options.logger) {
    extraDefaults.logger = createDefaultLogger();
  }
  const clientVars = common.initialize(env, user, options, platform, extraDefaults);
  const client = clientVars.client;

  client.close = () => clientVars.stop();

  clientVars.start();

  return clientVars.client;
}

export const createConsoleLogger = common.createConsoleLogger;

export const version = common.version;

function createDefaultLogger() {
  return new winston.Logger({
    level: 'warn',
    transports: [
      new winston.transports.Console({
        formatter: options => '[LaunchDarkly] ' + (options.message || ''),
      }),
    ],
  });
}
