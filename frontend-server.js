const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, 'src');
const PORT = Number(process.env.FRONTEND_PORT || 3010);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function resolvePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  
  // Se è un path diretto di una pagina .html, aggiungi /pages/
  let requestedPath;
  if (cleanPath === '/') {
    requestedPath = '/pages/index.html';
  } else if (cleanPath.endsWith('.html') && !cleanPath.startsWith('/pages/')) {
    requestedPath = `/pages${cleanPath}`;
  } else {
    requestedPath = cleanPath;
  }
  
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  return path.join(ROOT_DIR, normalizedPath);
}

function sendFile(filePath, response) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || 'application/octet-stream';

  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, { 'Content-Type': contentType });
    response.end(buffer);
  });
}

function proxyApi(request, response) {
  const targetUrl = new URL(request.url, 'http://127.0.0.1:3001');
  const client = targetUrl.protocol === 'https:' ? https : http;
  const headers = { ...request.headers, host: targetUrl.host };

  const proxyRequest = client.request({
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: `${targetUrl.pathname}${targetUrl.search}`,
    method: request.method,
    headers,
    timeout: 60000 // 60 secondi per le chiamate AI
  }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
    proxyResponse.pipe(response);
  });

  proxyRequest.on('error', () => {
    response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Backend non raggiungibile.' }));
  });

  proxyRequest.on('timeout', () => {
    proxyRequest.destroy();
    response.writeHead(504, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Il backend ha impiegato troppo tempo a rispondere.' }));
  });

  request.pipe(proxyRequest);
}

const server = http.createServer((request, response) => {
  if ((request.url || '').startsWith('/api/')) {
    proxyApi(request, response);
    return;
  }

  const filePath = resolvePath(request.url || '/');

  if (!filePath.startsWith(ROOT_DIR)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(filePath, response);
      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });
});

server.listen(PORT, () => {
  console.log(`BrainPlayng frontend disponibile su http://localhost:${PORT}`);
});
