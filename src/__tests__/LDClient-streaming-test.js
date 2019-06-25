const LDClient = require('../index');
const httpServer = require('./http-server');

// Unlike the LDClient-streaming-test.js in launchdarkly-js-sdk-common, which tests the client streaming logic
// against a mock EventSource, this does end-to-end testing against an embedded HTTP server to verify
// that the EventSource implementation we're using in Node basically works. Note that the EventSource
// implementation uses the Node HTTP API directly, not our abstraction in httpRequest.js.

describe('LDClient streaming', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const user = { key: 'user' };
  const encodedUser = 'eyJrZXkiOiJ1c2VyIn0';
  const expectedGetUrl = '/eval/' + envName + '/' + encodedUser;
  const expectedReportUrl = '/eval/' + envName;

  afterEach(() => {
    httpServer.closeServers();
  });

  function eventListenerPromise(emitter, event) {
    return new Promise(resolve => {
      emitter.on(event, resolve);
    });
  }

  it('makes GET request and receives an event', async () => {
    const eventData = { flag: { value: 'yes', version: 1 } };
    const server = await httpServer.createServer();
    httpServer.autoRespond(server, res => httpServer.respondSSEEvent(res, 'put', eventData));

    const config = { bootstrap: {}, streaming: true, baseUrl: server.url, streamUrl: server.url, sendEvents: false };
    const client = LDClient.initialize(envName, user, config);

    const p = eventListenerPromise(client, 'change:flag');
    await client.waitForInitialization();

    const value = await p;
    expect(value).toEqual('yes');

    expect(server.requests.length).toEqual(1);
    expect(server.requests[0].url).toEqual(expectedGetUrl);
    expect(server.requests[0].method).toEqual('GET');
  });

  it('makes REPORT request and receives an event', async () => {
    const server = await httpServer.createServer();
    let receivedBody;
    server.on('request', (req, res) => {
      httpServer.readAll(req).then(body => {
        receivedBody = body;
        httpServer.respondSSEEvent(res, 'put', { flag: { value: 'yes', version: 1 } });
      });
    });

    const config = { bootstrap: {}, streaming: true, streamUrl: server.url, sendEvents: false, useReport: true };
    const client = LDClient.initialize(envName, user, config);

    const p = eventListenerPromise(client, 'change:flag');
    await client.waitForInitialization();

    const value = await p;
    expect(value).toEqual('yes');

    expect(server.requests.length).toEqual(1);
    expect(server.requests[0].url).toEqual(expectedReportUrl);
    expect(server.requests[0].method).toEqual('REPORT');
    expect(receivedBody).toEqual(JSON.stringify(user));
  });
});
