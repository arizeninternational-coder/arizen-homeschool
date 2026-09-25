// Generate a JWT token for dev auth bypass
// The session endpoint (/api/auth/session) decodes without verifying signature
const header = Buffer.from(JSON.stringify({alg:'HS256','typ':'JWT'})).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const payload = Buffer.from(JSON.stringify({
  sub: 'test-user-id',
  email: 'test@example.com',
  name: 'Test Student',
  role: 'LEARNER',
  guildId: null,
  guildSlug: null,
  learnerProfileId: null,
  grade: 4,
  displayName: 'Test Student',
  totalXp: 0,
  currentStreak: 0,
  avatarUrl: null,
  iat: now,
  exp: now + 3600 * 24 * 30,
})).toString('base64url');
const sig = Buffer.from('fake-sig-for-dev').toString('base64url');
const token = header + '.' + payload + '.' + sig;
console.log(token);
