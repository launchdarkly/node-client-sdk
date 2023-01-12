const common = require('launchdarkly-js-sdk-common');
const { basicLogger } = require('./basicLogger');
const nodePlatform = require('./nodePlatform');
const packageJson = require('../package.json');

// This creates a client-side SDK instance to be used in Node.
function initialize(env, context, options = {}) {
  // Pass our platform object to the common code to create the Node version of the client
  const platform = nodePlatform(options);
  const extraOptionDefs = {
    localStoragePath: { type: 'string' },
    tlsParams: { type: 'object' },
  };
  if (!options.logger) {
    extraOptionDefs.logger = { default: basicLogger() };
  }
  const clientVars = common.initialize(env, context, options, platform, extraOptionDefs);

  clientVars.start();

  return clientVars.client;
}

module.exports = {
  initialize,
  basicLogger,
  version: packageJson.version,
};
