const selfsigned = require('selfsigned');

const LDClient = require('../index');
const httpServer = require('./http-server');

const stubLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('LDClient TLS configuration', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const user = { key: 'user' };
  let server;
  let certData;

  beforeEach(async () => {
    certData = await makeSelfSignedPems();
    const serverOptions = { key: certData.private, cert: certData.cert, ca: certData.public };
    server = await httpServer.createServer(true, serverOptions);
  });

  afterEach(() => {
    httpServer.closeServers();
  });

  async function makeSelfSignedPems() {
    const certAttrs = [{ name: 'commonName', value: 'localhost' }];
    const certOptions = {
      // This part is based on code within the selfsigned package
      extensions: [
        {
          name: 'subjectAltName',
          altNames: [{ type: 6, value: 'https://localhost' }],
        },
      ],
    };
    return await selfsigned.generate(certAttrs, certOptions);
  }

  it('can connect via HTTPS to a server with a self-signed certificate, if CA is specified', async () => {
    httpServer.autoRespond(server, res => httpServer.respondJson(res, {}));
    const config = {
      baseUrl: server.url,
      sendEvents: false,
      tlsParams: { ca: certData.cert },
    };
    const client = LDClient.initialize(envName, user, config);
    await client.waitForInitialization();
  });

  it('cannot connect via HTTPS to a server with a self-signed certificate, using default config', async () => {
    httpServer.autoRespond(server, res => httpServer.respondJson(res, {}));
    const config = {
      baseUrl: server.url,
      sendEvents: false,
      logger: stubLogger,
    };
    const client = LDClient.initialize(envName, user, config);
    await expect(client.waitForInitialization()).rejects.toThrow(/network error.*self signed/);
  });

  it('can use custom TLS options for streaming as well as polling', async () => {
    const eventData = { flag: { value: 'yes', version: 1 } };
    server.on('request', (req, res) => {
      if (req.url.match(/\/stream/)) {
        httpServer.respondSSEEvent(res, 'put', eventData);
      } else {
        httpServer.respondJson(res, {});
      }
    });

    const config = {
      baseUrl: server.url,
      streamUrl: server.url + '/stream',
      sendEvents: false,
      tlsParams: { ca: certData.cert },
    };

    const client = LDClient.initialize(envName, user, config);
    const changeEvent = new Promise(resolve => {
      client.on('change:flag', resolve);
    });

    await client.waitForInitialization();
    const newValue = await changeEvent;
    expect(newValue).toEqual('yes');
  });

  it('can use custom TLS options for posting events', async () => {
    let receivedEventFn;
    const receivedEvent = new Promise(resolve => {
      receivedEventFn = resolve;
    });

    server.on('request', (req, res) => {
      if (req.url.match(/\/events/)) {
        httpServer.readAll(req).then(body => {
          receivedEventFn(body);
          httpServer.respond(res, 200);
        });
      } else {
        httpServer.respondJson(res, {});
      }
    });

    const config = {
      baseUrl: server.url,
      eventsUrl: server.url + '/events',
      tlsParams: { ca: certData.cert },
    };

    const client = LDClient.initialize(envName, user, config);
    await client.waitForInitialization();
    await client.flush();

    const receivedEventBody = await receivedEvent;
    const eventData = JSON.parse(receivedEventBody);
    expect(eventData.length).toEqual(1);
    expect(eventData[0].kind).toEqual('identify');
  });
});
