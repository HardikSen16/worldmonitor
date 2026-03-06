import type { UserProfileInput } from '@/types/profile';
import { getCurrentIdToken } from '@/services/firebase-auth';

const PROFILE_STORAGE_VERSION = 1;

export interface StoredUserProfile {
  uid: string;
  email: string;
  profile: UserProfileInput;
  createdAt: string;
  updatedAt: string;
  version: number;
}

function getProfileStorageKey(uid: string): string {
  return `worldmonitor-user-profile:${uid}`;
}

function getLocalUserProfile(uid: string): StoredUserProfile | null {
  try {
    const raw = localStorage.getItem(getProfileStorageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUserProfile;
    if (!parsed?.uid || !parsed?.profile) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveLocalUserProfile(uid: string, email: string, profile: UserProfileInput): StoredUserProfile {
  const nowIso = new Date().toISOString();
  const existing = getLocalUserProfile(uid);
  const next: StoredUserProfile = {
    uid,
    email,
    profile,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
    version: PROFILE_STORAGE_VERSION,
  };
  localStorage.setItem(getProfileStorageKey(uid), JSON.stringify(next));
  return next;
}

async function fetchRemoteUserProfile(uid: string): Promise<StoredUserProfile | null> {
  const token = await getCurrentIdToken();
  if (!token) return null;

  const response = await fetch(`/api/user-profile?uid=${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.profile ?? null;
}

async function saveRemoteUserProfile(
  uid: string,
  email: string,
  profile: UserProfileInput
): Promise<StoredUserProfile | null> {
  const token = await getCurrentIdToken();
  if (!token) return null;

  const response = await fetch('/api/user-profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ uid, email, profile }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.profile ?? null;
}

export async function getStoredUserProfile(uid: string): Promise<StoredUserProfile | null> {
  const local = getLocalUserProfile(uid);
  try {
    const remote = await fetchRemoteUserProfile(uid);
    if (remote) {
      localStorage.setItem(getProfileStorageKey(uid), JSON.stringify(remote));
      return remote;
    }
  } catch (error) {
    console.warn('[profile-store] failed to fetch remote profile', error);
  }
  return local;
}

export async function saveUserProfile(
  uid: string,
  email: string,
  profile: UserProfileInput
): Promise<StoredUserProfile> {
  const localSaved = saveLocalUserProfile(uid, email, profile);
  try {
    const remote = await saveRemoteUserProfile(uid, email, profile);
    if (remote) {
      localStorage.setItem(getProfileStorageKey(uid), JSON.stringify(remote));
      return remote;
    }
  } catch (error) {
    console.warn('[profile-store] failed to save remote profile', error);
  }
  return localSaved;
}
