import { getCorsHeaders, isDisallowedOrigin } from './_cors.js';
import { getMongoDb } from './_mongo.js';
import { verifyFirebaseIdTokenFromRequest } from './_firebase-admin.js';

export const config = {
  runtime: 'nodejs',
};

const COLLECTION_NAME = 'user_profiles';

function isNonEmptyString(value, maxLength = 512) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isValidProfileObject(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return false;
  const required = [
    'role',
    'primaryGoal',
    'domainsOfInterest',
    'geoFocus',
    'experienceLevel',
    'updateFrequency',
    'marketInvolvement',
    'workspaceStyle',
    'wantsMapIntel',
  ];
  return required.every((key) => key in profile);
}

function applyHeaders(res, headers) {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
}

function parseUidFromQuery(req) {
  const raw = req?.query?.uid;
  if (Array.isArray(raw)) return (raw[0] || '').trim();
  return typeof raw === 'string' ? raw.trim() : '';
}

function parseBody(req) {
  if (!req?.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  const corsHeaders = getCorsHeaders(req, 'GET, PUT, OPTIONS');
  applyHeaders(res, corsHeaders);

  if (req.method === 'OPTIONS') {
    if (isDisallowedOrigin(req)) return res.status(403).end();
    return res.status(204).end();
  }

  if (isDisallowedOrigin(req)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decodedToken = await verifyFirebaseIdTokenFromRequest(req);
    const db = await getMongoDb();
    const collection = db.collection(COLLECTION_NAME);

    if (req.method === 'GET') {
      const uid = parseUidFromQuery(req);
      if (!isNonEmptyString(uid, 200)) {
        return res.status(400).json({ error: 'uid is required' });
      }
      if (uid !== decodedToken.uid) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const doc = await collection.findOne({ uid }, { projection: { _id: 0 } });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ profile: doc || null });
    }

    const body = parseBody(req);
    const uid = typeof body?.uid === 'string' ? body.uid.trim() : '';
    const profile = body?.profile;

    if (!isNonEmptyString(uid, 200)) {
      return res.status(400).json({ error: 'uid is required' });
    }
    if (uid !== decodedToken.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const email = typeof decodedToken.email === 'string' ? decodedToken.email.trim().toLowerCase() : '';
    if (!isNonEmptyString(email, 320)) {
      return res.status(400).json({ error: 'Token email is missing' });
    }
    if (!isValidProfileObject(profile)) {
      return res.status(400).json({ error: 'profile is invalid' });
    }

    const now = new Date().toISOString();
    const existing = await collection.findOne({ uid }, { projection: { createdAt: 1 } });

    const nextDoc = {
      uid,
      email,
      profile,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      version: 1,
    };

    await collection.updateOne({ uid }, { $set: nextDoc }, { upsert: true });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ profile: nextDoc });
  } catch (error) {
    console.error('[user-profile] error', error);
    if (error instanceof Error && (
      error.message.includes('bearer token') ||
      error.message.includes('verifyIdToken') ||
      error.message.includes('auth/')
    )) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
