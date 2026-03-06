import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getEnvValue } from './_env.js';

function getRequiredEnv(name) {
  const value = getEnvValue(name);
  if (!value || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  const privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function verifyFirebaseIdTokenFromRequest(request) {
  let authHeader = '';
  if (request?.headers?.get && typeof request.headers.get === 'function') {
    authHeader = request.headers.get('authorization') || '';
  } else if (request?.headers) {
    const raw = request.headers.authorization ?? request.headers.Authorization ?? '';
    authHeader = Array.isArray(raw) ? (raw[0] || '') : (typeof raw === 'string' ? raw : '');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Missing bearer token');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new Error('Missing bearer token');
  }

  const app = getFirebaseAdminApp();
  const auth = getAuth(app);
  return auth.verifyIdToken(token, true);
}
