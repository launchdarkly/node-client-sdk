const LDClient = require('../index');

const { TestHttpHandlers, TestHttpServers, withCloseable } = require('launchdarkly-js-test-helpers');

describe('LDClient', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const user = { key: 'user' };

  // Event generation in general is tested in a non-platform-specific way in launchdarkly-js-sdk-common.
  // The following tests just demonstrate that the common client calls our platform object when it
  // should.

  describe('event generation', () => {
    // This tests that the client calls our platform's getCurrentUrl() and isDoNotTrack() methods.
    it('sends an event for track()', async () => {
      await withCloseable(TestHttpServers.start, async server => {
        const config = { bootstrap: {}, eventsUrl: server.url, diagnosticOptOut: true };
        const client = LDClient.initialize(envName, user, config);
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
          expect(trackEvent.userKey).toEqual(user.key);
          expect(trackEvent.data).toEqual(data);
          expect(trackEvent.url).toEqual(null);
        });
      });
    });
  });

  describe('diagnostic events', () => {
    it('sends diagnostic init event', async () => {
      await withCloseable(TestHttpServers.start, async server => {
        server.byDefault(TestHttpHandlers.respond(202));
        const config = { bootstrap: {}, eventsUrl: server.url };
        const client = LDClient.initialize(envName, user, config);
        await withCloseable(client, async () => {
          const req0 = await server.nextRequest();
          const req1 = await server.nextRequest();
          // We should have received both the client's usual identify event and a diagnostic init event, but we can't be sure of the ordering.
          const expectedPath = '/events/diagnostic/' + envName;
          expect([req0.path, req1.path]).toContain(expectedPath);
          const req = req0.path === expectedPath ? req0 : req1;
          const data = JSON.parse(req.body);
          expect(data.kind).toEqual('diagnostic-init');
          expect(data.platform).toMatchObject({
            name: 'Node',
          });
          expect(data.sdk).toMatchObject({
            name: 'node-client-sdk',
          });
        });
      });
    });
  });
});
