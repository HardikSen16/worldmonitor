import type { User } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  subscribeToAuthState,
} from '@/services/firebase-auth';

type AuthMode = 'signin' | 'signup';

interface AuthGateOptions {
  onAuthenticated: (user: User) => void;
}

export class AuthGate {
  private container: HTMLElement;
  private options: AuthGateOptions;
  private mode: AuthMode = 'signin';
  private unsubscribeAuth: (() => void) | null = null;
  private formEl: HTMLFormElement | null = null;
  private errorEl: HTMLElement | null = null;
  private submitBtnEl: HTMLButtonElement | null = null;
  private toggleEl: HTMLButtonElement | null = null;
  private nameRowEl: HTMLElement | null = null;
  private headingEl: HTMLElement | null = null;
  private subtitleEl: HTMLElement | null = null;

  constructor(container: HTMLElement, options: AuthGateOptions) {
    this.container = container;
    this.options = options;
  }

  public mount(): void {
    this.render();
    this.unsubscribeAuth = subscribeToAuthState((user) => {
      if (user) {
        this.options.onAuthenticated(user);
      }
    });
  }

  public destroy(): void {
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = null;
  }

  private render(): void {
    this.container.innerHTML = `
      <main class="auth-shell">
        <section class="auth-card" aria-labelledby="authHeading">
          <p class="auth-kicker">World Monitor</p>
          <h1 id="authHeading" class="auth-heading">Sign in</h1>
          <p class="auth-subtitle">Sign in to continue to your personalized dashboard.</p>

          <form id="authForm" class="auth-form" novalidate>
            <label class="auth-field auth-name-row" id="authNameRow" hidden>
              <span>Name</span>
              <input id="authName" type="text" autocomplete="name" placeholder="Your name" />
            </label>

            <label class="auth-field">
              <span>Email</span>
              <input id="authEmail" type="email" autocomplete="email" required placeholder="you@example.com" />
            </label>

            <label class="auth-field">
              <span>Password</span>
              <input id="authPassword" type="password" autocomplete="current-password" required minlength="6" placeholder="Minimum 6 characters" />
            </label>

            <p id="authError" class="auth-error" role="alert" aria-live="polite"></p>

            <button id="authSubmitBtn" class="auth-submit" type="submit">Sign in</button>
          </form>

          <div class="auth-footer">
            <span id="authToggleLabel">New here?</span>
            <button id="authToggleBtn" type="button" class="auth-toggle">Create account</button>
          </div>
        </section>
      </main>
    `;

    this.formEl = this.container.querySelector('#authForm');
    this.errorEl = this.container.querySelector('#authError');
    this.submitBtnEl = this.container.querySelector('#authSubmitBtn');
    this.toggleEl = this.container.querySelector('#authToggleBtn');
    this.nameRowEl = this.container.querySelector('#authNameRow');
    this.headingEl = this.container.querySelector('#authHeading');
    this.subtitleEl = this.container.querySelector('.auth-subtitle');

    this.formEl?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.handleSubmit();
    });
    this.toggleEl?.addEventListener('click', () => this.toggleMode());
    this.updateModeUi();
  }

  private toggleMode(): void {
    this.mode = this.mode === 'signin' ? 'signup' : 'signin';
    this.clearError();
    this.updateModeUi();
  }

  private updateModeUi(): void {
    if (!this.submitBtnEl || !this.toggleEl || !this.headingEl || !this.subtitleEl || !this.nameRowEl) {
      return;
    }

    const isSignUp = this.mode === 'signup';
    this.headingEl.textContent = isSignUp ? 'Create account' : 'Sign in';
    this.subtitleEl.textContent = isSignUp
      ? 'Create your account first. Profile setup comes in the next step.'
      : 'Sign in to continue to your personalized dashboard.';
    this.submitBtnEl.textContent = isSignUp ? 'Create account' : 'Sign in';
    this.toggleEl.textContent = isSignUp ? 'Already have an account?' : 'Create account';
    this.nameRowEl.hidden = !isSignUp;
  }

  private clearError(): void {
    if (this.errorEl) this.errorEl.textContent = '';
  }

  private setError(message: string): void {
    if (this.errorEl) this.errorEl.textContent = message;
  }

  private async handleSubmit(): Promise<void> {
    if (!this.formEl || !this.submitBtnEl) return;

    const emailInput = this.formEl.querySelector<HTMLInputElement>('#authEmail');
    const passwordInput = this.formEl.querySelector<HTMLInputElement>('#authPassword');
    const nameInput = this.formEl.querySelector<HTMLInputElement>('#authName');

    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const name = nameInput?.value.trim() || '';

    if (!email || !password) {
      this.setError('Please enter email and password.');
      return;
    }
    if (this.mode === 'signup' && password.length < 6) {
      this.setError('Password must be at least 6 characters.');
      return;
    }

    this.clearError();
    this.submitBtnEl.disabled = true;
    this.submitBtnEl.textContent = this.mode === 'signup' ? 'Creating...' : 'Signing in...';

    try {
      if (this.mode === 'signup') {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed.';
      this.setError(errorMessage);
    } finally {
      this.submitBtnEl.disabled = false;
      this.submitBtnEl.textContent = this.mode === 'signup' ? 'Create account' : 'Sign in';
    }
  }
}
