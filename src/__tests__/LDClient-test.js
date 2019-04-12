import * as LDClient from '../index';
import * as httpServer from './http-server';

describe('LDClient', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const user = { key: 'user' };
  let server;
  let requests;

  beforeEach(async () => {
    server = await httpServer.createServer();
    server.on('request', (req, res) => {
      requests.push(req);
      httpServer.respond(res, 200, { 'Content-Type': 'application/json' }, '{}');
    });
    requests = [];
  });

  afterEach(() => {
    httpServer.closeServers();
  });

  it('should exist', () => {
    expect(LDClient).toBeDefined();
  });

  describe('initialization', () => {
    it('should trigger the ready event', async () => {
      const client = LDClient.initialize(envName, user, { baseUrl: server.url, sendEvents: false });
      await client.waitForInitialization();
    });

    it('sends correct User-Agent in request', async () => {
      const client = LDClient.initialize(envName, user, { baseUrl: server.url });
      await client.waitForInitialization();

      expect(requests.length).toEqual(1);
      expect(requests[0].headers['x-launchdarkly-user-agent']).toMatch(/^NodeClientSide\//);
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
      const client = LDClient.initialize(envName, user, {
        bootstrap: {},
        sendEvents: false,
        logger: logger,
      });
      await client.waitForInitialization();

      client.track('whatever');
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });
});
