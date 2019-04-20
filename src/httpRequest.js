// Node implementation of the HTTP abstraction used by ldclient-js-common.
// This logic should be the same in the client-side Node SDK as in the Electron SDK.

const http = require('http');
const https = require('https');

function newHttpRequest(method, url, headers, body, tlsParams) {
  const isHttps = url.match(/^https:/);

  const baseParams = {
    method: method,
    headers: headers,
    body: body,
  };
  const requestParams = isHttps ? Object.assign({}, tlsParams, baseParams) : baseParams;

  let request;
  const p = new Promise((resolve, reject) => {
    request = (isHttps ? https : http).request(url, requestParams, res => {
      let resBody = '';
      res.on('data', chunk => {
        resBody += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          header: name => res.headers[name.toLowerCase()], // note that the Node HTTP API will lowercase these for us
          body: resBody,
        });
      });
    });

    request.on('error', reject);
    if (body) {
      request.write(body);
    }
    request.end();
  });

  function cancel() {
    request && request.abort();
  }

  return { promise: p, cancel: cancel };
}

module.exports = newHttpRequest;
