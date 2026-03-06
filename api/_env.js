import fs from 'fs';
import path from 'path';

let cachedLocalEnv = null;

function stripWrappingQuotes(value) {
  if (!value) return value;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const rawValue = trimmed.slice(idx + 1);
    result[key] = stripWrappingQuotes(rawValue.trim());
  }
  return result;
}

function loadLocalEnvMap() {
  if (cachedLocalEnv) return cachedLocalEnv;

  const cwd = process.cwd();
  const merged = {
    ...parseEnvFile(path.join(cwd, '.env.local')),
    ...parseEnvFile(path.join(cwd, '.vercel', '.env.development.local')),
  };
  cachedLocalEnv = merged;
  return merged;
}

export function getEnvValue(name) {
  const fromProcess = process.env[name];
  if (typeof fromProcess === 'string' && fromProcess.trim()) {
    return fromProcess.trim();
  }
  const fromLocalFiles = loadLocalEnvMap()[name];
  if (typeof fromLocalFiles === 'string' && fromLocalFiles.trim()) {
    return fromLocalFiles.trim();
  }
  return '';
}
