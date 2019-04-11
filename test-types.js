"use strict";
// This file exists only so that we can run the TypeScript compiler in the CI build
// to validate our typings.d.ts file.
exports.__esModule = true;
var launchdarkly_node_client_sdk_1 = require("launchdarkly-node-client-sdk");
var emptyOptions = {};
var logger = launchdarkly_node_client_sdk_1.createConsoleLogger("info");
var allOptions = {
    bootstrap: {},
    baseUrl: '',
    eventsUrl: '',
    streamUrl: '',
    streaming: true,
    useReport: true,
    sendLDHeaders: true,
    evaluationReasons: true,
    sendEvents: true,
    allAttributesPrivate: true,
    privateAttributeNames: ['x'],
    allowFrequentDuplicateEvents: true,
    sendEventsOnlyForVariation: true,
    flushInterval: 1,
    samplingInterval: 1,
    streamReconnectDelay: 1,
    logger: logger,
    localStoragePath: '.'
};
var user = { key: 'user' };
var client = launchdarkly_node_client_sdk_1.initialize('env', user, allOptions);
