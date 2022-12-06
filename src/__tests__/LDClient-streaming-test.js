const LDClient = require('../index');

const {
  AsyncQueue,
  TestHttpHandlers,
  TestHttpServers,
  eventSink,
  withCloseable,
} = require('launchdarkly-js-test-helpers');

// Unlike the LDClient-streaming-test.js in launchdarkly-js-sdk-common, which tests the client streaming logic
// against a mock EventSource, this does end-to-end testing against an embedded HTTP server to verify
// that the EventSource implementation we're using in Node basically works. Note that the EventSource
// implementation uses the Node HTTP API directly, not our abstraction in httpRequest.js.

describe('LDClient streaming', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const context = { key: 'user' };
  const encodedContext = 'eyJrZXkiOiJ1c2VyIn0';
  const expectedGetUrl = '/eval/' + envName + '/' + encodedContext;
  const expectedReportUrl = '/eval/' + envName;

  it('makes GET request and receives an event', async () => {
    await withCloseable(TestHttpServers.start, async server => {
      await withCloseable(new AsyncQueue(), async eventQueue => {
        const eventData = { flag: { value: 'yes', version: 1 } };
        eventQueue.add({ type: 'put', data: JSON.stringify(eventData) });
        server.forMethodAndPath('get', expectedGetUrl, TestHttpHandlers.sseStream(eventQueue));

        const config = {
          bootstrap: {},
          streaming: true,
          baseUrl: server.url,
          streamUrl: server.url,
          sendEvents: false,
        };
        await withCloseable(LDClient.initialize(envName, context, config), async client => {
          const changeEvents = eventSink(client, 'change:flag');
          await client.waitForInitialization();

          const value = await changeEvents.take();
          expect(value).toEqual(['yes', undefined]); // second parameter to change event is old value

          expect(server.requestCount()).toEqual(1);
        });
      });
    });
  });

  it('makes REPORT request and receives an event', async () => {
    await withCloseable(TestHttpServers.start, async server => {
      await withCloseable(new AsyncQueue(), async eventQueue => {
        const eventData = { flag: { value: 'yes', version: 1 } };
        eventQueue.add({ type: 'put', data: JSON.stringify(eventData) });
        server.forMethodAndPath('report', expectedReportUrl, TestHttpHandlers.sseStream(eventQueue));

        const config = {
          bootstrap: {},
          streaming: true,
          baseUrl: server.url,
          streamUrl: server.url,
          sendEvents: false,
          useReport: true,
        };
        await withCloseable(LDClient.initialize(envName, context, config), async client => {
          const changeEvents = eventSink(client, 'change:flag');
          await client.waitForInitialization();

          const value = await changeEvents.take();
          expect(value).toEqual(['yes', undefined]); // second parameter to change event is old value

          expect(server.requestCount()).toEqual(1);
          const req = await server.nextRequest();
          expect(req.body).toEqual(JSON.stringify(context));
        });
      });
    });
  });
});
