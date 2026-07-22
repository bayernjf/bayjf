interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface PagesEnv {
  ASSETS: AssetsBinding;
  API_BASE_URL?: string;
}

const REQUEST_HEADERS_TO_REMOVE = [
  'host',
  'cf-connecting-ip',
  'cf-ray',
  'cf-visitor',
  'cf-worker',
];

const RESPONSE_HEADERS_TO_REMOVE = [
  'content-encoding',
  'set-cookie',
  'access-control-allow-credentials',
];

function unavailable(): Response {
  return Response.json(
    { error: 'API_UNAVAILABLE', message: 'The API service is temporarily unavailable.' },
    { status: 502 },
  );
}

function isApiRequest(url: URL): boolean {
  return url.pathname === '/api' || url.pathname.startsWith('/api/');
}

function proxyRequestHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);
  REQUEST_HEADERS_TO_REMOVE.forEach((header) => headers.delete(header));
  return headers;
}

function proxyResponseHeaders(response: Response): Headers {
  const headers = new Headers(response.headers);
  RESPONSE_HEADERS_TO_REMOVE.forEach((header) => headers.delete(header));
  return headers;
}

export async function handleRequest(request: Request, env: PagesEnv): Promise<Response> {
  const url = new URL(request.url);
  if (!isApiRequest(url)) return env.ASSETS.fetch(request);
  if (!env.API_BASE_URL) return unavailable();

  try {
    const target = new URL(`${url.pathname}${url.search}`, env.API_BASE_URL);
    const upstream = await fetch(new Request(target, {
      method: request.method,
      headers: proxyRequestHeaders(request),
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
      // Node requires this when a request body is a ReadableStream. Cloudflare
      // Workers ignore the additional fetch option.
      duplex: 'half',
    } as RequestInit));

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: proxyResponseHeaders(upstream),
    });
  } catch {
    return unavailable();
  }
}

export default {
  fetch: (request: Request, env: PagesEnv) => handleRequest(request, env),
};
