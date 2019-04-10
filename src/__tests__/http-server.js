import * as http from 'http';

// This is adapted from some helper code in https://github.com/EventSource/eventsource/blob/master/test/eventsource_test.js

let nextPort = 20000;
let servers = [];

export function createServer() {
  const server = http.createServer();
  const port = nextPort++;

  const responses = [];

  server.on('request', (req, res) => {
    responses.push(res);
  });

  const realClose = server.close;
  server.close = callback => {
    responses.forEach(res => res.end());
    realClose.call(server, callback);
  };

  server.closePromise = () => new Promise(resolve => server.close(resolve));

  server.url = 'http://localhost:' + port;

  servers.push(server);

  return new Promise((resolve, reject) => {
    server.listen(port, err => (err ? reject(err) : resolve(server)));
  });
}

export function closeServers() {
  servers.forEach(server => server.close());
  servers = [];
}

export function readAll(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', data => {
      body += data;
    });
    req.on('end', () => resolve(body));
  });
}

export function respond(res, status, headers, body) {
  res.writeHead(status, headers);
  body && res.write(body);
  res.end();
}
