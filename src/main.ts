import './styles/main.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as Sentry from '@sentry/browser';
import { inject } from '@vercel/analytics';
import type { User } from 'firebase/auth';
import { App } from './App';
import { AuthGate } from '@/components/AuthGate';
import { ProfileOnboarding } from '@/components/ProfileOnboarding';
import { isFirebaseAuthConfigured, signOutCurrentUser } from '@/services/firebase-auth';
import { isAdminEmail } from '@/services/admin-access';
import { applyUserPersonalization } from '@/services/personalization';
import { getStoredUserProfile, saveUserProfile } from '@/services/profile-store';
import { isMobileDevice } from '@/utils';

// Initialize Sentry error tracking (early as possible)
Sentry.init({
  dsn: 'https://afc9a1c85c6ba49f8464a43f8de74ccd@o4509927897890816.ingest.us.sentry.io/4510906342113280',
  release: `worldmonitor@${__APP_VERSION__}`,
  environment: location.hostname === 'worldmonitor.app' ? 'production'
    : location.hostname.includes('vercel.app') ? 'preview'
    : 'development',
  enabled: !location.hostname.startsWith('localhost') && !('__TAURI_INTERNALS__' in window),
  sendDefaultPii: true,
  tracesSampleRate: 0.1,
  ignoreErrors: [
    'Invalid WebGL2RenderingContext',
    'WebGL context lost',
    /ResizeObserver loop/,
  ],
});
import { debugInjectTestEvents, debugGetCells, getCellCount } from '@/services/geo-convergence';
import { initMetaTags } from '@/services/meta-tags';
import { installRuntimeFetchPatch } from '@/services/runtime';
import { loadDesktopSecrets } from '@/services/runtime-config';
import { applyStoredTheme } from '@/utils/theme-manager';
import { clearChunkReloadGuard, installChunkReloadGuard } from '@/bootstrap/chunk-reload';

// Auto-reload on stale chunk 404s after deployment (Vite fires this for modulepreload failures).
const chunkReloadStorageKey = installChunkReloadGuard(__APP_VERSION__);

// Initialize Vercel Analytics
inject();

// Initialize dynamic meta tags for sharing
initMetaTags();

// In desktop mode, route /api/* calls to the local Tauri sidecar backend.
installRuntimeFetchPatch();
void loadDesktopSecrets();

// Apply stored theme preference before app initialization (safety net for inline script)
applyStoredTheme();

// Remove no-transition class after first paint to enable smooth theme transitions
requestAnimationFrame(() => {
  document.documentElement.classList.remove('no-transition');
});

let dashboardApp: App | null = null;
let currentUser: User | null = null;

async function startDashboard(): Promise<void> {
  if (dashboardApp) return;

  dashboardApp = new App('app');
  await dashboardApp.init();

  // Clear the one-shot guard after a successful boot so future stale-chunk incidents can recover.
  clearChunkReloadGuard(chunkReloadStorageKey);
}

function mountProfileOnboarding(
  appRoot: HTMLElement,
  user: User,
  mode: 'create' | 'edit',
  initialProfile: import('@/types/profile').UserProfileInput | null,
): void {
  const onboarding = new ProfileOnboarding(appRoot, {
    userEmail: user.email ?? 'unknown user',
    initialProfile,
    mode,
    onCancel: () => {
      onboarding.destroy();
      void startDashboard().catch(console.error);
    },
    onComplete: (profile) => {
      void (async () => {
        await saveUserProfile(user.uid, user.email ?? '', profile);
        applyUserPersonalization(profile, isMobileDevice());
        onboarding.destroy();
        await restartDashboard();
      })().catch(console.error);
    },
  });
  onboarding.mount();
}

async function stopDashboard(): Promise<void> {
  if (!dashboardApp) return;
  dashboardApp.destroy();
  dashboardApp = null;
}

async function restartDashboard(): Promise<void> {
  await stopDashboard();
  await startDashboard();
}

async function handleAuthenticatedUser(user: User, appRoot: HTMLElement): Promise<void> {
  currentUser = user;
  const isAdmin = isAdminEmail(user.email);
  localStorage.setItem('worldmonitor-auth-user-email', user.email ?? '');
  localStorage.setItem('worldmonitor-is-admin', isAdmin ? '1' : '0');

  if (isAdmin) {
    await startDashboard();
    return;
  }

  const existingProfile = await getStoredUserProfile(user.uid);
  if (existingProfile) {
    applyUserPersonalization(existingProfile.profile, isMobileDevice());
    await startDashboard();
    return;
  }

  mountProfileOnboarding(appRoot, user, 'create', null);
}

function mountAuthGate(appRoot: HTMLElement): void {
  appRoot.innerHTML = '';

  const authGate = new AuthGate(appRoot, {
    onAuthenticated: (user) => {
      authGate.destroy();
      void handleAuthenticatedUser(user, appRoot).catch(console.error);
    },
  });
  authGate.mount();
}

function bootstrap(): void {
  const appRoot = document.getElementById('app');
  if (!appRoot) {
    throw new Error('App root #app not found');
  }

  if (!isFirebaseAuthConfigured()) {
    console.warn('[auth] Firebase config missing; skipping auth gate and loading dashboard directly.');
    void startDashboard().catch(console.error);
    return;
  }

  window.addEventListener('worldmonitor:edit-profile-request', () => {
    void (async () => {
      if (!currentUser || localStorage.getItem('worldmonitor-is-admin') === '1') return;
      const existingProfile = await getStoredUserProfile(currentUser.uid);
      await stopDashboard();
      mountProfileOnboarding(appRoot, currentUser, 'edit', existingProfile?.profile ?? null);
    })().catch(console.error);
  });

  window.addEventListener('worldmonitor:logout-request', () => {
    void (async () => {
      await stopDashboard();
      currentUser = null;
      localStorage.removeItem('worldmonitor-auth-user-email');
      localStorage.removeItem('worldmonitor-is-admin');
      try {
        await signOutCurrentUser();
      } catch (error) {
        console.warn('[auth] sign out failed', error);
      }
      mountAuthGate(appRoot);
    })().catch(console.error);
  });

  mountAuthGate(appRoot);
}

bootstrap();

// Debug helpers for geo-convergence testing (remove in production)
(window as unknown as Record<string, unknown>).geoDebug = {
  inject: debugInjectTestEvents,
  cells: debugGetCells,
  count: getCellCount,
};

if (!('__TAURI_INTERNALS__' in window) && !('__TAURI__' in window)) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(async () => {
            if (!navigator.onLine) return;
            try { await registration.update(); } catch {}
          }, 60 * 60 * 1000);
        }
      },
      onOfflineReady() {
        console.log('[PWA] App ready for offline use');
      },
    });
  });
}
