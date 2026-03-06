import { MongoClient } from 'mongodb';
import { getEnvValue } from './_env.js';

let cachedClient = null;

function getRequiredEnv(name) {
  const value = getEnvValue(name);
  if (!value || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

export async function getMongoDb() {
  if (!cachedClient) {
    const uri = getRequiredEnv('MONGODB_URI');
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
    });
    await cachedClient.connect();
  }

  const dbName = (getEnvValue('MONGODB_DB_NAME') || 'worldmonitor').trim();
  return cachedClient.db(dbName);
}
