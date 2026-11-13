/**
 * The NextAuth signing secret.
 *
 * Read once, and never with a fallback. The previous behaviour defaulted to the
 * literal string "arizen-dev-secret-change-in-production", which means any
 * environment missing NEXTAUTH_SECRET would sign and verify sessions with a
 * value published in this repository — enough to forge a session for any user,
 * including an ADMIN.
 *
 * Failing loudly is the correct behaviour: a missing secret is a deployment
 * error, not a degraded mode.
 */

let cached: string | null = null;

export function getAuthSecret(): string {
  if (cached) return cached;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Sessions cannot be signed or verified, and this app " +
        "refuses to fall back to a hardcoded default. Add it to .env.local and to the " +
        "Vercel project env (generate one with: openssl rand -base64 32)."
    );
  }

  cached = secret;
  return cached;
}

/** True when the secret is configured. For health checks; never logs the value. */
export function hasAuthSecret(): boolean {
  return Boolean(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim() !== "");
}
