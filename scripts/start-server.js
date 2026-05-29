#!/usr/bin/env node

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4174;
const DIST_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.ttf', 'font/ttf'],
  ['.wasm', 'application/wasm'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

if (!existsSync(DIST_DIR)) {
  console.error('dist directory does not exist. Run `npm run build` first.');
  process.exit(1);
}

startServer();

function startServer() {
  const server = createServer(handleRequest);

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${DEFAULT_PORT} is already in use.`);
      console.error(`Study Quiz Manager data is stored for http://${DEFAULT_HOST}:${DEFAULT_PORT} only.`);
      console.error('Use the already running app or stop that process before starting this server.');
      process.exit(1);
      return;
    }

    console.error(error);
    process.exit(1);
  });

  server.listen(DEFAULT_PORT, DEFAULT_HOST, () => {
    console.log(`Study Quiz Manager is running at http://${DEFAULT_HOST}:${DEFAULT_PORT}`);
    console.log(`Serving files from ${DIST_DIR}`);
  });

  process.on('SIGINT', () => shutdown(server));
  process.on('SIGTERM', () => shutdown(server));
}

function handleRequest(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  const filePath = resolveRequestedPath(request.url ?? '/');
  if (!filePath) {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }

  const targetPath = existsSync(filePath) && statSync(filePath).isFile() ? filePath : join(DIST_DIR, 'index.html');
  const contentType = mimeTypes.get(extname(targetPath).toLowerCase()) ?? 'application/octet-stream';

  response.writeHead(200, {
    'Cache-Control': shouldRevalidate(targetPath) ? 'no-cache' : 'public, max-age=3600',
    'Content-Type': contentType,
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(targetPath).pipe(response);
}

function resolveRequestedPath(url) {
  let pathname;
  let decodedPath;
  try {
    pathname = new URL(url, 'http://localhost').pathname;
    decodedPath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  } catch {
    return undefined;
  }

  const normalizedPath = normalize(decodedPath).replace(/^([/\\])+/, '');
  const resolvedPath = resolve(DIST_DIR, normalizedPath);
  const relativePath = relative(DIST_DIR, resolvedPath);

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return join(DIST_DIR, 'index.html');
  }

  return resolvedPath;
}

function shouldRevalidate(filePath) {
  return (
    filePath.endsWith('index.html') ||
    filePath.endsWith('manifest.webmanifest') ||
    filePath.endsWith('registerSW.js') ||
    filePath.endsWith('sw.js')
  );
}

function shutdown(server) {
  server.close(() => {
    process.exit(0);
  });
}
