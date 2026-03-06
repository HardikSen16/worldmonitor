const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(.*\.)?worldmonitor\.app$/,
  /^https:\/\/worldmonitor-[a-z0-9-]+-elie-habib-projects\.vercel\.app$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/tauri\.localhost(:\d+)?$/,
  /^https?:\/\/[a-z0-9-]+\.tauri\.localhost(:\d+)?$/i,
  /^tauri:\/\/localhost$/,
  /^asset:\/\/localhost$/,
];

function getHeader(req, name) {
  if (!req || !req.headers) return '';

  // Edge/Fetch Request headers API
  if (typeof req.headers.get === 'function') {
    return req.headers.get(name) || '';
  }

  // Node.js/Vercel headers object API
  const value = req.headers[name] ?? req.headers[name.toLowerCase()] ?? req.headers[name.toUpperCase()];
  if (Array.isArray(value)) return value[0] || '';
  return typeof value === 'string' ? value : '';
}

function isAllowedOrigin(origin) {
  return Boolean(origin) && ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

export function getCorsHeaders(req, methods = 'GET, OPTIONS') {
  const origin = getHeader(req, 'origin');
  const allowOrigin = isAllowedOrigin(origin) ? origin : 'https://worldmonitor.app';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function isDisallowedOrigin(req) {
  const origin = getHeader(req, 'origin');
  if (!origin) return false;
  return !isAllowedOrigin(origin);
}
