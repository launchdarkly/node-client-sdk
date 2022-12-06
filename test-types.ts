
// This file exists only so that we can run the TypeScript compiler in the CI build
// to validate our typings.d.ts file.

import * as ld from 'launchdarkly-node-client-sdk';

const ver: string = ld.version;

const emptyOptions: ld.LDOptions = {};
const logger: ld.LDLogger = ld.basicLogger({ level: 'info' });
const allOptions: ld.LDOptions = {
  bootstrap: { },
  baseUrl: '',
  eventsUrl: '',
  streamUrl: '',
  streaming: true,
  useReport: true,
  sendLDHeaders: true,
  evaluationReasons: true,
  sendEvents: true,
  allAttributesPrivate: true,
  privateAttributes: [ 'x' ],
  sendEventsOnlyForVariation: true,
  flushInterval: 1,
  streamReconnectDelay: 1,
  logger: logger
};
const userWithKeyOnly: ld.LDUser = { key: 'user' };
const contextWithKey: ld.LDContext = {kind: 'user', key: 'user-key'};
const anonymousUser: ld.LDUser = { key: 'anon-user', anonymous: true };
const user: ld.LDUser = {
  key: 'user',
  name: 'name',
  firstName: 'first',
  lastName: 'last',
  email: 'test@example.com',
  avatar: 'http://avatar.url',
  ip: '1.1.1.1',
  country: 'us',
  anonymous: true,
  custom: {
    'a': 's',
    'b': true,
    'c': 3,
    'd': [ 'x', 'y' ],
    'e': [ true, false ],
    'f': [ 1, 2 ]
  },
  privateAttributeNames: [ 'name', 'email' ]
};

const singleContext: ld.LDContext = {
  kind: 'user',
  key: 'user',
  name: 'name',
  firstName: 'first',
  lastName: 'last',
  email: 'test@example.com',
  avatar: 'http://avatar.url',
  ip: '1.1.1.1',
  country: 'us',
  anonymous: true,
  _meta: {
    privateAttributes: ['country']
  }
};

const multiContext: ld.LDContext = {
  kind: 'multi',
  user: { key: 'user-key' },
  org: { key: 'org-key' }
};


const client: ld.LDClient = ld.initialize('env', user, allOptions);

client.waitUntilReady().then(() => {});
client.waitForInitialization().then(() => {});

client.identify(user).then(() => {});
client.identify(user, undefined, () => {});
client.identify(user, 'hash').then(() => {});

client.identify(contextWithKey).then(() => {});
client.identify(contextWithKey, undefined, () => {});
client.identify(contextWithKey, 'hash').then(() => {});

client.identify(singleContext).then(() => {});
client.identify(singleContext, undefined, () => {});
client.identify(singleContext, 'hash').then(() => {});

client.identify(multiContext).then(() => {});
client.identify(multiContext, undefined, () => {});
client.identify(multiContext, 'hash').then(() => {});


const context: ld.LDContext = client.getContext();

client.flush(() => {});
client.flush().then(() => {});

const boolFlagValue: ld.LDFlagValue = client.variation('key', false);
const numberFlagValue: ld.LDFlagValue = client.variation('key', 2);
const stringFlagValue: ld.LDFlagValue = client.variation('key', 'default');

const detail: ld.LDEvaluationDetail = client.variationDetail('key', 'default');
const detailValue: ld.LDFlagValue = detail.value;
const detailIndex: number | undefined = detail.variationIndex;
const detailReason: ld.LDEvaluationReason | undefined = detail.reason;

client.setStreaming(true);
client.setStreaming();

function handleEvent() {}
client.on('event', handleEvent);
client.off('event', handleEvent);

client.track('event');
client.track('event', { someData: 'x' });
client.track('event', null, 3.5);

const flagSet: ld.LDFlagSet = client.allFlags();
const flagSetValue: ld.LDFlagValue = flagSet['key'];

client.close(() => {});
client.close().then(() => {});
