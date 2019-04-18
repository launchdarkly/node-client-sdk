const { LocalStorage } = require('node-localstorage');
const { EventSource } = require('launchdarkly-eventsource');
const path = require('path');
const newHttpRequest = require('./httpRequest');

function makeNodePlatform(options) {
  const storagePath = path.join(options.localStoragePath || '.', 'ldclient-user-cache');
  const storage = new LocalStorage(storagePath);
  const tlsParams = filterTlsParams(options.tlsParams);

  const ret = {};

  ret.httpRequest = (method, url, headers, body) => newHttpRequest(method, url, headers, body, tlsParams);

  ret.httpAllowsPost = () => true;

  ret.getCurrentUrl = () => null;

  ret.isDoNotTrack = () => false;

  ret.localStorage = {
    get: key =>
      new Promise(resolve => {
        resolve(storage.getItem(key));
      }),
    set: (key, value) =>
      new Promise(resolve => {
        storage.setItem(key, value);
        resolve();
      }),
    clear: key =>
      new Promise(resolve => {
        storage.removeItem(key);
        resolve();
      }),
  };

  ret.eventSourceFactory = (url, options) => new EventSource(url, Object.assign({}, tlsParams, options));
  ret.eventSourceIsActive = es => es.readyState === EventSource.OPEN || es.readyState === EventSource.CONNECTING;
  ret.eventSourceAllowsReport = true;

  ret.userAgent = 'NodeClientSide';

  return ret;
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
