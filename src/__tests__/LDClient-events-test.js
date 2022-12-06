const LDClient = require('../index');

const { TestHttpHandlers, TestHttpServers, sleepAsync, withCloseable } = require('launchdarkly-js-test-helpers');

describe('LDClient', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const context = { key: 'user' };

  // Event generation in general is tested in a non-platform-specific way in launchdarkly-js-sdk-common.
  // The following tests just demonstrate that the common client calls our platform object when it
  // should.

  describe('event generation', () => {
    // This tests that the client calls our platform's getCurrentUrl() and isDoNotTrack() methods.
    it('sends an event for track()', async () => {
      await withCloseable(TestHttpServers.start, async server => {
        const config = { bootstrap: {}, eventsUrl: server.url, diagnosticOptOut: true };
        const client = LDClient.initialize(envName, context, config);
        await withCloseable(client, async () => {
          const data = { thing: 'stuff' };
          await client.waitForInitialization();

          client.track('eventkey', data);
          await client.flush();

          const req = await server.nextRequest();
          expect(req.path).toEqual('/events/bulk/' + envName);
          const events = JSON.parse(req.body);
          expect(events.length).toEqual(2); // first is identify event
          const trackEvent = events[1];
          expect(trackEvent.kind).toEqual('custom');
          expect(trackEvent.key).toEqual('eventkey');
          expect(trackEvent.contextKeys).toEqual({ user: 'user' });
          expect(trackEvent.data).toEqual(data);
          expect(trackEvent.url).toEqual(null);
        });
      });
    });
  });

  async function expectDiagnosticEventAndDiscardRegularEvent(server) {
    const req0 = await server.nextRequest();
    const req1 = await server.nextRequest();
    const expectedPath = '/events/diagnostic/' + envName;
    const otherPath = '/events/bulk/' + envName;
    let initEventReq;
    if (req0.path === expectedPath) {
      expect(req1.path).toEqual(otherPath);
      initEventReq = req0;
    } else {
      expect(req0.path).toEqual(otherPath);
      expect(req1.path).toEqual(expectedPath);
      initEventReq = req1;
    }
    return JSON.parse(initEventReq.body);
  }

  async function expectNoMoreRequests(server, timeout) {
    await sleepAsync(timeout);
    expect(server.requests.length()).toEqual(0);
  }

  describe('diagnostic events', () => {
    it('sends diagnostic init event', async () => {
      await withCloseable(TestHttpServers.start, async server => {
        server.byDefault(TestHttpHandlers.respond(202));
        const config = { bootstrap: {}, eventsUrl: server.url };
        const client = LDClient.initialize(envName, context, config);
        await withCloseable(client, async () => {
          const data = await expectDiagnosticEventAndDiscardRegularEvent(server);
          expect(data.kind).toEqual('diagnostic-init');
          expect(data.platform).toMatchObject({
            name: 'Node',
          });
          expect(data.sdk).toMatchObject({
            name: 'node-client-sdk',
          });
          await expectNoMoreRequests(server, 50);
        });
      });
    });
  });
});
