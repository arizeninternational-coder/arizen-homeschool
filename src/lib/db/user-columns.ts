/**
 * Column lists for the `User` table.
 *
 * `passwordHash` is deliberately absent from USER_PUBLIC_COLUMNS. A bcrypt hash
 * is offline-crackable, so it must never travel to a client, a log line, or any
 * route that merely needs to identify a user.
 *
 * Only the credential check may request USER_AUTH_COLUMNS, and the value must be
 * used for `bcrypt.compare` and then discarded. `tests/password-hash-exposure.test.ts`
 * enforces this: it fails if `passwordHash` appears outside the allowlisted files.
 */

/** Everything a route may know about a user. Safe to return to the caller. */
export const USER_PUBLIC_COLUMNS = "id, name, email, image, role, guildId, createdAt";

/** USER_PUBLIC_COLUMNS plus the hash. Credential verification only — never log or return. */
export const USER_AUTH_COLUMNS = `${USER_PUBLIC_COLUMNS}, passwordHash`;
