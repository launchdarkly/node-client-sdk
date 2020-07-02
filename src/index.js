const common = require('launchdarkly-js-sdk-common');
const winston = require('winston');
const nodePlatform = require('./nodePlatform');
const packageJson = require('../package.json');

// This creates a client-side SDK instance to be used in Node.
function initialize(env, user, options = {}) {
  // Pass our platform object to the common code to create the Node version of the client
  const platform = nodePlatform(options);
  const extraOptionDefs = {
    localStoragePath: { type: 'string' },
    tlsParams: { type: 'object' },
  };
  if (!options.logger) {
    extraOptionDefs.logger = { default: createDefaultLogger() };
  }
  const clientVars = common.initialize(env, user, options, platform, extraOptionDefs);

  clientVars.start();

  return clientVars.client;
}

function createDefaultLogger() {
  const prefixFormat = winston.format(info => {
    // eslint-disable-next-line no-param-reassign
    info.message = `[LaunchDarkly] ${info.message ? info.message : ''}`;
    return info;
  });

  return winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(prefixFormat(), winston.format.simple()),
      }),
    ],
  });
}

module.exports = {
  initialize: initialize,
  createConsoleLogger: common.createConsoleLogger,
  version: packageJson.version,
};
