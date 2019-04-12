import * as selfsigned from 'selfsigned';

import * as LDClient from '../index';
import * as httpServer from './http-server';

describe('LDClient TLS configuration', () => {
  const envName = 'UNKNOWN_ENVIRONMENT_ID';
  const user = { key: 'user' };

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
    const pems = await makeSelfSignedPems();
    const serverOptions = { key: pems.private, cert: pems.cert, ca: pems.public };
    const server = await httpServer.createServer(true, serverOptions);
    httpServer.autoRespond(server, res => httpServer.respondJson(res, {}));

    const config = {
      baseUrl: server.url,
      sendEvents: false,
      tlsParams: {
        ca: pems.cert,
      },
    };
    const client = LDClient.initialize(envName, user, config);
    await client.waitForInitialization();
  });

  it('cannot connect via HTTPS to a server with a self-signed certificate, using default config', async () => {
    const pems = await makeSelfSignedPems();
    const serverOptions = { key: pems.private, cert: pems.cert, ca: pems.public };
    const server = await httpServer.createServer(true, serverOptions);
    httpServer.autoRespond(server, res => httpServer.respondJson(res, {}));

    const config = {
      baseUrl: server.url,
      sendEvents: false,
    };
    const client = LDClient.initialize(envName, user, config);
    await expect(client.waitForInitialization()).rejects.toThrow(/network error.*self signed/);
  });
});
