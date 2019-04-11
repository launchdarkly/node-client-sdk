import { LocalStorage } from 'node-localstorage';
import { EventSource } from 'launchdarkly-eventsource';
import path from 'path';
import newHttpRequest from './httpRequest';

export default function makeNodePlatform(options) {
  const storagePath = path.join(options.localStoragePath || '.', 'ldclient-user-cache');
  const storage = new LocalStorage(storagePath);
  const tlsParams = filterTlsParams(options.tlsParams);

  const ret = {};

  ret.httpRequest = (method, url, headers, body) => newHttpRequest(method, url, headers, body, tlsParams);
  // Note that the common code also allows newHttpRequest to take a "synchronous" parameter, but that is only
  // meaningful in a browser so it's ignored here.

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
