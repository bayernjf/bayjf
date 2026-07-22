import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { app } from './app';
import type { Env } from './types';

function loadLocalEnv() {
  const path = '.env.local';
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

loadLocalEnv();

const env: Env = {
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
};

const server = createServer(async (nodeRequest, nodeResponse) => {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of nodeRequest) chunks.push(Buffer.from(chunk));
    const method = nodeRequest.method ?? 'GET';
    const request = new Request(`http://${nodeRequest.headers.host ?? 'localhost:8787'}${nodeRequest.url ?? '/'}`, {
      method,
      headers: nodeRequest.headers as Record<string, string>,
      body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
      // Node's fetch Request requires this opt-in for streamed request bodies.
      duplex: 'half',
    } as RequestInit);
    const response = await app.fetch(request, env);
    nodeResponse.statusCode = response.status;
    response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));
    nodeResponse.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('Local API request failed', error);
    nodeResponse.statusCode = 500;
    nodeResponse.setHeader('Content-Type', 'application/json');
    nodeResponse.end(JSON.stringify({ error: 'INTERNAL_ERROR' }));
  }
});

const port = Number(process.env.API_PORT ?? 8787);
server.listen(port, '0.0.0.0', () => {
  console.log(`Local API listening on http://localhost:${port}`);
});
