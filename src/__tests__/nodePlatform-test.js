const nodePlatform = require('../nodePlatform');

const httpServer = require('./http-server');

describe('nodePlatform', () => {
  const platform = nodePlatform({});
  const lsKeyPrefix = 'ldclient-node-client-test:';

  describe('httpRequest()', () => {
    const path = '/path';

    afterEach(() => {
      httpServer.closeServers();
    });

    it('tells the SDK it can support POST', () => {
      expect(platform.httpAllowsPost()).toBe(true);
    });

    it('sets request properties without body', async () => {
      const server = await httpServer.createServer();
      const requests = [];
      server.on('request', (req, res) => {
        requests.push(req);
        httpServer.respond(res, 200);
      });

      const method = 'GET';
      const headers = { a: '1', b: '2' };
      await platform.httpRequest(method, server.url + path, headers).promise;

      expect(requests.length).toEqual(1);
      const req = requests[0];

      expect(req.method).toEqual(method);
      expect(req.url).toEqual(path);
      expect(req.headers['a']).toEqual('1');
      expect(req.headers['b']).toEqual('2');
    });

    it('sets request properties with body', async () => {
      const server = await httpServer.createServer();
      const requests = [];
      let receivedBody;
      server.on('request', (req, res) => {
        requests.push(req);
        httpServer.readAll(req).then(body => {
          receivedBody = body;
          httpServer.respond(res, 200);
        });
      });

      const method = 'POST';
      const headers = { a: '1', b: '2' };
      const body = '{}';
      await platform.httpRequest(method, server.url + path, headers, body).promise;

      expect(requests.length).toEqual(1);
      const req = requests[0];

      expect(req.method).toEqual(method);
      expect(req.url).toEqual(path);
      expect(req.headers['a']).toEqual('1');
      expect(req.headers['b']).toEqual('2');
      expect(receivedBody).toEqual(body);
    });

    it('resolves promise when response is received', async () => {
      const server = await httpServer.createServer();
      server.on('request', (req, res) => {
        httpServer.respond(res, 200, { 'Content-Type': 'text/plain' }, 'hello');
      });

      const requestInfo = platform.httpRequest('GET', server.url);

      const result = await requestInfo.promise;
      expect(result.status).toEqual(200);
      expect(result.header('content-type')).toEqual('text/plain');
      expect(result.body).toEqual('hello');
    });

    it('rejects promise if request gets a network error', async () => {
      const requestInfo = platform.httpRequest('GET', 'http://no-such-host');

      await expect(requestInfo.promise).rejects.toThrow();
    });
  });

  describe('getCurrentUrl()', () => {
    it('returns null', () => {
      expect(platform.getCurrentUrl()).toBeNull();
    });
  });

  describe('isDoNotTrack()', () => {
    it('returns false', () => {
      expect(platform.isDoNotTrack()).toEqual(false);
    });
  });

  describe('local storage', () => {
    it('returns null or undefined for missing value', async () => {
      const value = await platform.localStorage.get(lsKeyPrefix + 'unused-key');
      expect(value).not.toBe(expect.anything());
    });

    it('can get and set value', async () => {
      const key = lsKeyPrefix + 'get-set-key';
      await platform.localStorage.set(key, 'hello');
      const value = await platform.localStorage.get(key);
      expect(value).toEqual('hello');
    });

    it('can delete value', async () => {
      const key = lsKeyPrefix + 'delete-key';
      await platform.localStorage.set(key, 'hello');
      await platform.localStorage.clear(key);
      const value = await platform.localStorage.get(key);
      expect(value).not.toBe(expect.anything());
    });
  });

  describe('EventSource', () => {
    it('supports REPORT mode', () => {
      expect(platform.eventSourceAllowsReport).toBe(true);
    });
  });
});
