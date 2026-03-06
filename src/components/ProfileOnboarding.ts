import { PROFILE_QUESTIONS } from '@/config/profile';
import type { UserProfileInput } from '@/types/profile';

interface ProfileOnboardingOptions {
  userEmail: string;
  initialProfile?: UserProfileInput | null;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
  onComplete: (profile: UserProfileInput) => void;
}

export class ProfileOnboarding {
  private container: HTMLElement;
  private options: ProfileOnboardingOptions;
  private formEl: HTMLFormElement | null = null;
  private errorEl: HTMLElement | null = null;
  private submitBtnEl: HTMLButtonElement | null = null;
  private cancelBtnEl: HTMLButtonElement | null = null;

  constructor(container: HTMLElement, options: ProfileOnboardingOptions) {
    this.container = container;
    this.options = options;
  }

  public mount(): void {
    this.render();
    this.bindEvents();
  }

  public destroy(): void {
    this.container.innerHTML = '';
    this.formEl = null;
    this.errorEl = null;
    this.submitBtnEl = null;
    this.cancelBtnEl = null;
  }

  private render(): void {
    const initialProfile = this.options.initialProfile;
    const mode = this.options.mode ?? 'create';
    const isEdit = mode === 'edit';

    const questionsHtml = PROFILE_QUESTIONS.map((question) => {
      const inputType = question.multiSelect ? 'checkbox' : 'radio';
      const selectedValues = this.getInitialValuesForQuestion(question.id, initialProfile);
      const optionsHtml = question.options.map((option) => `
        <label class="profile-option">
          <input
            type="${inputType}"
            name="${question.id}"
            value="${option.value}"
            ${selectedValues.includes(option.value) ? 'checked' : ''}
          />
          <span class="profile-option-label">${option.label}</span>
          <span class="profile-option-desc">${option.description}</span>
        </label>
      `).join('');

      return `
        <section class="profile-question">
          <h2>${question.title}</h2>
          <p>${question.helpText}</p>
          <div class="profile-options">${optionsHtml}</div>
        </section>
      `;
    }).join('');

    this.container.innerHTML = `
      <main class="profile-shell">
        <section class="profile-card">
          <p class="profile-kicker">Profile Setup</p>
          <h1>${isEdit ? 'Edit your profile' : 'Create your personalized dashboard'}</h1>
          <p class="profile-subtitle">Signed in as ${this.escapeHtml(this.options.userEmail)}.</p>
          <form id="profileForm" class="profile-form" novalidate>
            ${questionsHtml}
            <section class="profile-question">
              <h2>Enable map intelligence by default?</h2>
              <p>You can always change this later.</p>
              <label class="profile-option profile-option-inline">
                <input type="checkbox" name="wantsMapIntel" ${initialProfile?.wantsMapIntel ?? true ? 'checked' : ''} />
                <span class="profile-option-label">Yes, keep map intelligence visible</span>
              </label>
            </section>
            <p id="profileError" class="profile-error" role="alert" aria-live="polite"></p>
            <div class="profile-actions">
              ${isEdit ? '<button id="profileCancel" type="button" class="profile-cancel">Cancel</button>' : ''}
              <button id="profileSubmit" type="submit" class="profile-submit">${isEdit ? 'Save profile' : 'Save profile and continue'}</button>
            </div>
          </form>
        </section>
      </main>
    `;
  }

  private bindEvents(): void {
    this.formEl = this.container.querySelector('#profileForm');
    this.errorEl = this.container.querySelector('#profileError');
    this.submitBtnEl = this.container.querySelector('#profileSubmit');
    this.cancelBtnEl = this.container.querySelector('#profileCancel');

    this.formEl?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.handleSubmit();
    });

    this.cancelBtnEl?.addEventListener('click', () => {
      this.options.onCancel?.();
    });
  }

  private setError(message: string): void {
    if (this.errorEl) this.errorEl.textContent = message;
  }

  private clearError(): void {
    if (this.errorEl) this.errorEl.textContent = '';
  }

  private getSingleValue(name: string): string {
    const input = this.formEl?.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
    return input?.value ?? '';
  }

  private getMultiValues(name: string): string[] {
    if (!this.formEl) return [];
    return Array.from(
      this.formEl.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)
    ).map((input) => input.value);
  }

  private async handleSubmit(): Promise<void> {
    if (!this.formEl || !this.submitBtnEl) return;

    const domains = this.getMultiValues('domainsOfInterest');
    const geoFocus = this.getMultiValues('geoFocus');

    if (domains.length === 0) {
      this.setError('Please select at least one domain of interest.');
      return;
    }
    if (geoFocus.length === 0) {
      this.setError('Please select at least one region.');
      return;
    }
    if (domains.length > 4) {
      this.setError('Please select up to 4 domains for better relevance.');
      return;
    }

    this.clearError();
    this.submitBtnEl.disabled = true;

    const profile: UserProfileInput = {
      role: this.getSingleValue('role') as UserProfileInput['role'],
      primaryGoal: this.getSingleValue('primaryGoal') as UserProfileInput['primaryGoal'],
      domainsOfInterest: domains as UserProfileInput['domainsOfInterest'],
      geoFocus: geoFocus as UserProfileInput['geoFocus'],
      experienceLevel: this.getSingleValue('experienceLevel') as UserProfileInput['experienceLevel'],
      updateFrequency: this.getSingleValue('updateFrequency') as UserProfileInput['updateFrequency'],
      marketInvolvement: this.getSingleValue('marketInvolvement') as UserProfileInput['marketInvolvement'],
      workspaceStyle: this.getSingleValue('workspaceStyle') as UserProfileInput['workspaceStyle'],
      wantsMapIntel: Boolean(this.formEl.querySelector<HTMLInputElement>('input[name="wantsMapIntel"]')?.checked),
    };

    this.options.onComplete(profile);
  }

  private getInitialValuesForQuestion(
    questionId: string,
    initialProfile?: UserProfileInput | null
  ): string[] {
    if (!initialProfile) {
      const question = PROFILE_QUESTIONS.find((item) => item.id === questionId);
      const defaultValue = question?.options[0]?.value;
      return defaultValue ? [defaultValue] : [];
    }

    switch (questionId) {
      case 'role':
        return [initialProfile.role];
      case 'primaryGoal':
        return [initialProfile.primaryGoal];
      case 'domainsOfInterest':
        return initialProfile.domainsOfInterest;
      case 'geoFocus':
        return initialProfile.geoFocus;
      case 'experienceLevel':
        return [initialProfile.experienceLevel];
      case 'updateFrequency':
        return [initialProfile.updateFrequency];
      case 'marketInvolvement':
        return [initialProfile.marketInvolvement];
      case 'workspaceStyle':
        return [initialProfile.workspaceStyle];
      default: {
        const question = PROFILE_QUESTIONS.find((item) => item.id === questionId);
        const defaultValue = question?.options[0]?.value;
        return defaultValue ? [defaultValue] : [];
      }
    }
  }

  private escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
