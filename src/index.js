const common = require('ldclient-js-common');
const winston = require('winston');
const nodePlatform = require('./nodePlatform');

// This creates a client-side SDK instance to be used in Node.
function initialize(env, user, options = {}) {
  // Pass our platform object to the common code to create the Node version of the client
  const platform = nodePlatform(options);
  const extraDefaults = {};
  if (!options.logger) {
    extraDefaults.logger = createDefaultLogger();
  }
  const clientVars = common.initialize(env, user, options, platform, extraDefaults);

  clientVars.start();

  return clientVars.client;
}

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

module.exports = {
  initialize: initialize,
  createConsoleLogger: common.createConsoleLogger,
  version: VERSION
};
