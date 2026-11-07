const url = require('node:url');
const querystring = require('node:querystring');
const os = require('node:os');

function handleRequest(req, res) {

  const parsed = url.parse(req.url);
  const pathname = parsed.pathname;
  const method = req.method;

  const query = parsed.query ? querystring.parse(parsed.query) : {};

  if (pathname === '/hello' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Hello World');
    return;
  }


  if (pathname === '/info' && method === 'GET') {
    const info = {
      platform: os.platform(),
      hostname: os.hostname(),
      homedir: os.homedir(),
      freemem: os.freemem(),
      totalmem: os.totalmem(),
      loadavg: os.loadavg(),
      uptime: os.uptime()
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(info, null, 2));
    return;
  }

  // все остальное 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

module.exports = { handleRequest };