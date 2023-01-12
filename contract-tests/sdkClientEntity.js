const ld = require('launchdarkly-node-client-sdk');

const { Log, sdkLogger } = require('./log');

const badCommandError = new Error('unsupported command');

function makeSdkConfig(options, tag) {
  if (!options.clientSide) {
    throw new Error('configuration did not include clientSide options');
  }

  const isSet = x => x !== null && x !== undefined;
  const maybeTime = seconds => isSet(seconds) ? seconds / 1000 : undefined;

  const cf = {
    autoAliasingOptOut: options.clientSide.autoAliasingOptOut,
    evaluationReasons: options.clientSide.evaluationReasons,
    logger: sdkLogger(tag),
    useReport: options.clientSide.useReport,
    sendEventsOnlyForVariation: true,
  };
  
  if (options.serviceEndpoints) {
    cf.streamUrl = options.serviceEndpoints.streaming;
    cf.baseUrl = options.serviceEndpoints.polling;
    cf.eventsUrl = options.serviceEndpoints.events;
  }

  if (options.streaming) {
    if (options.streaming.baseUri) {
      cf.streamUrl = options.streaming.baseUri;
    }
    cf.streaming = true;
    cf.streamReconnectDelay = maybeTime(options.streaming.initialRetryDelayMs);
  }

  if (options.polling) {
    if (options.polling.baseUri) {
      cf.baseUrl = options.polling.baseUri;
    }
  }

  if (options.events) {
    if (options.events.baseUri) {
      cf.eventsUrl = options.events.baseUri;
    }
    cf.allAttributesPrivate = options.events.allAttributesPrivate;
    cf.eventCapacity = options.events.capacity;
    cf.diagnosticOptOut = !options.events.enableDiagnostics;
    cf.flushInterval = maybeTime(options.events.flushIntervalMs);
    cf.privateAttributes = options.events.globalPrivateAttributes;
  } else {
    cf.sendEvents = false;
  }

  if (options.tags) {
    cf.application = {
      id: options.tags.applicationId,
      version: options.tags.applicationVersion
    };
  }

  return cf;
}

function makeDefaultInitialContext() {
  return {kind: 'user', key: 'key-not-specified'};
}

async function newSdkClientEntity(options) {
  const c = {};
  const log = Log(options.tag);

  log.info('Creating client with configuration: ' + JSON.stringify(options.configuration));
  
  const timeout =
    options.configuration.startWaitTimeMs !== null && options.configuration.startWaitTimeMs !== undefined
      ? options.configuration.startWaitTimeMs
      : 5000;
  const sdkConfig = makeSdkConfig(options.configuration, options.tag);
  const initialContext = options.configuration.clientSide?.initialUser ||
    options.configuration.clientSide?.initialContext ||
    makeDefaultInitialContext();
  const client = ld.initialize(
    options.configuration.credential || 'unknown-env-id',
    initialContext,
    sdkConfig
  );
  let failed = false;
  try {
    await Promise.race([client.waitForInitialization(), new Promise((resolve, reject) => setTimeout(reject, timeout))]);
  } catch (_) {
    // we get here if waitForInitialization() rejects or if we timed out
    failed = true
  }
  if (failed && !options.configuration.initCanFail) {
    client.close();
    throw new Error('client initialization failed');
  }

  c.close = () => {
    client.close();
    log.info('Test ended');
  };

  c.doCommand = async params => {
    log.info('Received command: ' + params.command);
    switch (params.command) {
      case 'evaluate': {
        const pe = params.evaluate;
        if (pe.detail) {
          return client.variationDetail(pe.flagKey, pe.defaultValue);
        } else {
          const value = client.variation(pe.flagKey, pe.defaultValue);
          return { value };
        }
      }

      case 'evaluateAll':
        return { state: client.allFlags() };

      case 'identifyEvent':
        await client.identify(params.identifyEvent.user || params.identifyEvent.context);
        return undefined;

      case 'customEvent': {
        const pce = params.customEvent;
        client.track(pce.eventKey, pce.data, pce.metricValue);
        return undefined;
      }

      case 'flushEvents':
        client.flush();
        return undefined;

      default:
        throw badCommandError;
    }
  };

  return c;
}

module.exports.newSdkClientEntity = newSdkClientEntity;
module.exports.badCommandError = badCommandError;
