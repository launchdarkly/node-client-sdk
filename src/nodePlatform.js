import { LocalStorage } from 'node-localstorage';
import { EventSource } from 'launchdarkly-eventsource';
import path from 'path';
import newHttpRequest from './httpRequest';

export default function makeNodePlatform(options) {
  const storagePath = path.join(options.localStoragePath || '.', 'ldclient-user-cache');
  const storage = new LocalStorage(storagePath);

  const ret = {};

  ret.httpRequest = (method, url, headers, body) => newHttpRequest(options, method, url, headers, body);
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

  ret.eventSourceFactory = (url, options) => new EventSource(url, options);
  ret.eventSourceIsActive = es => es.readyState === EventSource.OPEN || es.readyState === EventSource.CONNECTING;
  ret.eventSourceAllowsReport = true;

  ret.userAgent = 'NodeClientSide';

  return ret;
}
