function parseAdminEmails(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getConfiguredAdminEmails(): string[] {
  const raw = (import.meta as { env?: Record<string, unknown> }).env?.VITE_ADMIN_EMAILS;
  return typeof raw === 'string' ? parseAdminEmails(raw) : [];
}

export function getAdminEmailAllowlist(): string[] {
  return getConfiguredAdminEmails();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;
  return getConfiguredAdminEmails().includes(normalizedEmail);
}
