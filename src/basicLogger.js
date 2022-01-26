const { commonBasicLogger } = require('launchdarkly-js-sdk-common');
const { format } = require('util');

function basicLogger(options) {
  return commonBasicLogger({ destination: console.log, ...options }, format);
}

module.exports = {
  basicLogger,
};
