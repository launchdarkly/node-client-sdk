const LDClient = require('../index');
import * as packageJson from '../../package.json';

const { TestHttpHandlers, TestHttpServers, withCloseable } = require('launchdarkly-js-test-helpers');

describe('LDClient', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const context = { key: 'user' };

  it('should exist', () => {
    expect(LDClient).toBeDefined();
  });

  it('should report correct version', () => {
    expect(LDClient.version).toEqual(packageJson.version);
  });

  describe('initialization', () => {
    it('should trigger the ready event', async () => {
      await withCloseable(TestHttpServers.start, async server => {
        server.byDefault(TestHttpHandlers.respondJson({}));
        const config = { baseUrl: server.url, sendEvents: false };
        await withCloseable(LDClient.initialize(envName, context, config), async client => {
          await client.waitForInitialization();
        });
      });
    });

    it('sends correct User-Agent in request', async () => {
      await withCloseable(TestHttpServers.start, async server => {
        server.byDefault(TestHttpHandlers.respondJson({}));
        const config = { baseUrl: server.url, sendEvents: false };
        await withCloseable(LDClient.initialize(envName, context, config), async client => {
          await client.waitForInitialization();

          expect(server.requestCount()).toEqual(1);
          const req = await server.nextRequest();
          expect(req.headers['user-agent']).toMatch(/^NodeClientSide\//);
        });
      });
    });
  });

  describe('track()', () => {
    it('should not warn when tracking an arbitrary custom event', async () => {
      const logger = {
        debug: () => {},
        info: () => {},
        warn: jest.fn(),
        error: jest.fn(),
      };
      const config = { bootstrap: {}, sendEvents: false, logger: logger };
      await withCloseable(LDClient.initialize(envName, context, config), async client => {
        await client.waitForInitialization();

        client.track('whatever');
        expect(logger.warn).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
      });
    });
  });
});
