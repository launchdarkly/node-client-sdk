const { LocalStorage } = require('node-localstorage');
const { EventSource } = require('launchdarkly-eventsource');
const os = require('os');
const path = require('path');
const newHttpRequest = require('./httpRequest');
const packageJson = require('../package.json');

function makeNodePlatform(options) {
  const tlsParams = filterTlsParams(options.tlsParams);

  // Don't initialize local storage unless it's used, because it'll create a directory
  const storagePath = path.join(options.localStoragePath || '.', 'ldclient-user-cache');
  let storage;
  function getLocalStorage() {
    if (!storage) {
      storage = new LocalStorage(storagePath);
    }
    return storage;
  }

  const ret = {};

  ret.httpRequest = (method, url, headers, body) => newHttpRequest(method, url, headers, body, tlsParams);

  ret.httpAllowsPost = () => true;

  ret.getCurrentUrl = () => null;

  ret.isDoNotTrack = () => false;

  ret.localStorage = {
    get: key =>
      new Promise(resolve => {
        resolve(getLocalStorage().getItem(key));
      }),
    set: (key, value) =>
      new Promise(resolve => {
        getLocalStorage().setItem(key, value);
        resolve();
      }),
    clear: key =>
      new Promise(resolve => {
        getLocalStorage().removeItem(key);
        resolve();
      }),
  };

  ret.eventSourceFactory = (url, options) => new EventSource(url, Object.assign({}, tlsParams, options));
  ret.eventSourceIsActive = es => es.readyState === EventSource.OPEN || es.readyState === EventSource.CONNECTING;
  ret.eventSourceAllowsReport = true;

  ret.userAgent = 'NodeClientSide';
  ret.version = packageJson.version;

  ret.diagnosticSdkData = {
    name: 'node-client-sdk',
    version: packageJson.version,
  };

  ret.diagnosticPlatformData = {
    name: 'Node',
    nodeVersion: process.versions.node,
    osArch: os.arch(),
    osName: normalizePlatformName(os.platform()),
    osVersion: os.release(),
  };

  return ret;
}

function normalizePlatformName(platformName) {
  // The following logic is based on how Node.js reports the platform name
  switch (platformName) {
    case 'darwin':
      return 'MacOS';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return platformName;
  }
}

const httpsOptions = [
  'pfx',
  'key',
  'passphrase',
  'cert',
  'ca',
  'ciphers',
  'rejectUnauthorized',
  'secureProtocol',
  'servername',
  'checkServerIdentity',
];

function filterTlsParams(tlsParams) {
  const input = tlsParams || {};
  return Object.keys(input)
    .filter(key => httpsOptions.includes(key))
    .reduce((obj, key) => Object.assign({}, obj, { [key]: input[key] }), {});
}

module.exports = makeNodePlatform;
