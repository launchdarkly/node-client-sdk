const LDClient = require('../index');

const {
  AsyncQueue,
  TestHttpHandlers,
  TestHttpServers,
  eventSink,
  withCloseable,
} = require('launchdarkly-js-test-helpers');

const stubLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('LDClient TLS configuration', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const context = { key: 'user' };
  const encodedContext = 'eyJrZXkiOiJ1c2VyIn0';
  const expectedPollingUrl = '/sdk/evalx/' + envName + '/contexts/' + encodedContext;
  const expectedStreamingUrl = '/eval/' + envName + '/' + encodedContext;

  it('can connect via HTTPS to a server with a self-signed certificate, if CA is specified', async () => {
    await withCloseable(TestHttpServers.startSecure, async server => {
      server.byDefault(TestHttpHandlers.respondJson({}));
      const config = {
        baseUrl: server.url,
        sendEvents: false,
        tlsParams: { ca: server.certificate },
        diagnosticOptOut: true,
      };
      await withCloseable(LDClient.initialize(envName, context, config), async client => {
        await client.waitForInitialization();
      });
    });
  });

  it('cannot connect via HTTPS to a server with a self-signed certificate, using default config', async () => {
    await withCloseable(TestHttpServers.startSecure, async server => {
      server.byDefault(TestHttpHandlers.respondJson({}));
      const config = {
        baseUrl: server.url,
        sendEvents: false,
        logger: stubLogger,
        diagnosticOptOut: true,
      };
      await withCloseable(LDClient.initialize(envName, context, config), async client => {
        await expect(client.waitForInitialization()).rejects.toThrow(/network error.*self[- ]signed/);
      });
    });
  });

  it('can use custom TLS options for streaming as well as polling', async () => {
    await withCloseable(TestHttpServers.startSecure, async server => {
      const eventData = { key: 'flag', value: 'yes', version: 1 };
      await withCloseable(new AsyncQueue(), async eventQueue => {
        eventQueue.add({ type: 'patch', data: JSON.stringify(eventData) });
        server.forMethodAndPath('get', expectedPollingUrl, TestHttpHandlers.respondJson({}));
        server.forMethodAndPath('get', expectedStreamingUrl, TestHttpHandlers.sseStream(eventQueue));

        const config = {
          baseUrl: server.url,
          streamUrl: server.url,
          streaming: true,
          sendEvents: false,
          tlsParams: { ca: server.certificate },
          diagnosticOptOut: true,
        };
        await withCloseable(LDClient.initialize(envName, context, config), async client => {
          const changeEvents = eventSink(client, 'change:flag');

          await client.waitForInitialization();

          const value = await changeEvents.take();
          expect(value).toEqual(['yes', undefined]); // second parameter to change event is old value
        });
      });
    });
  });

  it('can use custom TLS options for posting events', async () => {
    await withCloseable(TestHttpServers.startSecure, async server => {
      server.forMethodAndPath('post', '/events/bulk/' + envName, TestHttpHandlers.respond(200));

      const config = {
        bootstrap: {},
        baseUrl: server.url,
        eventsUrl: server.url + '/events',
        tlsParams: { ca: server.certificate },
        diagnosticOptOut: true,
      };
      await withCloseable(LDClient.initialize(envName, context, config), async client => {
        await client.waitForInitialization();
        await client.flush();

        expect(server.requestCount()).toEqual(1);
        const req = await server.nextRequest();
        const eventData = JSON.parse(req.body);
        expect(eventData.length).toEqual(1);
        expect(eventData[0].kind).toEqual('identify');
      });
    });
  });
});
