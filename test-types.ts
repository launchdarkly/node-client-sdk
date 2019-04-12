
// This file exists only so that we can run the TypeScript compiler in the CI build
// to validate our typings.d.ts file.

import {
  createConsoleLogger,
  LDClient,
  LDLogger,
  LDOptions,
  LDUser,
  initialize
} from 'launchdarkly-node-client-sdk';

var emptyOptions: LDOptions = {};
var logger: LDLogger = createConsoleLogger("info");
var allOptions: LDOptions = {
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
  privateAttributeNames: [ 'x' ],
  allowFrequentDuplicateEvents: true,
  sendEventsOnlyForVariation: true,
  flushInterval: 1,
  samplingInterval: 1,
  streamReconnectDelay: 1,
  logger: logger,
  localStoragePath: '.'
};
var user: LDUser = { key: 'user' };
var client: LDClient = initialize('env', user, allOptions);
