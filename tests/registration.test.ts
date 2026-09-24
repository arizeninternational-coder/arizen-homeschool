/**
 * Tests for Registration Flow — Integration tests against real endpoints
 * 
 * Run with: npx tsx tests/registration.test.ts
 */

const PROD = 'https://arizen-homeschool.vercel.app';

let passed = 0;
let failed = 0;
const createdUserIds: string[] = [];

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

async function main() {
  console.log('=== Registration Flow Integration Tests ===\n');

  // Test 1: Successful registration
  console.log('Test 1: Successful registration');
  const testEmail = `regtest_${Date.now()}@arizen.com`;
  const testPassword = 'test123456';
  const testName = 'Registration Test User';

  try {
    const res = await fetch(`${PROD}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        displayName: testName,
        grade: 4,
        role: 'LEARNER',
      }),
    });
    const data = await res.json();
    
    assert(res.status === 201, `Registration succeeded (status ${res.status})`);
    assert(data.user?.id !== undefined, 'User ID returned');
    assert(data.user?.email === testEmail.toLowerCase(), 'Email matches');
    assert(data.user?.role === 'LEARNER', 'Role is LEARNER');
    assert(data.user?.learnerProfile?.id !== undefined, 'LearnerProfile created');
    assert(data.user?.learnerProfile?.grade === 4, 'Grade is 4');
    
    if (data.user?.id) createdUserIds.push(data.user.id);
    
    console.log(`  📝 Created user: ${data.user?.id}`);
    console.log(`  📝 LearnerProfile: ${data.user?.learnerProfile?.id}`);
  } catch (err: any) {
    assert(false, `Registration failed: ${err.message}`);
  }

  // Test 2: Login after registration
  console.log('\nTest 2: Login after registration');
  try {
    const res = await fetch(`${PROD}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const data = await res.json();
    
    assert(res.status === 200, `Login succeeded (status ${res.status})`);
    assert(data.ok === true, 'Login ok');
    assert(data.user?.id !== undefined, 'User ID in response');
    assert(data.user?.email === testEmail.toLowerCase(), 'Email matches');
    assert(data.user?.role === 'LEARNER', 'Role is LEARNER');
    assert(data.redirectUrl === '/dashboard/student', 'Redirects to student dashboard');
    
    // Check cookie is set
    const cookies = res.headers.get('set-cookie');
    assert(cookies !== null, 'Session cookie set');
    assert(cookies?.includes('next-auth.session-token') || cookies?.includes('__Secure-next-auth.session-token'), 'Cookie name correct');
    
    console.log(`  📝 Logged in as: ${data.user?.email}`);
    console.log(`  📝 Cookie set: ${cookies ? 'YES' : 'NO'}`);
  } catch (err: any) {
    assert(false, `Login failed: ${err.message}`);
  }

  // Test 3: Duplicate email rejection
  console.log('\nTest 3: Duplicate email rejection');
  try {
    const res = await fetch(`${PROD}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Test',
        email: testEmail,
        password: testPassword,
        displayName: 'Duplicate',
        grade: 4,
        role: 'LEARNER',
      }),
    });
    const data = await res.json();
    
    assert(res.status === 409, `Duplicate rejected (status ${res.status})`);
    assert(data.error?.includes('already exists') || data.error?.includes('duplicate'), 'Error message mentions duplicate');
    
    console.log(`  📝 Duplicate rejected with: ${data.error}`);
  } catch (err: any) {
    assert(false, `Duplicate check failed: ${err.message}`);
  }

  // Test 4: Missing fields validation
  console.log('\nTest 4: Missing fields validation');
  const invalidBodies = [
    { body: { email: '', password: 'test123456', name: 'Test' }, field: 'email' },
    { body: { email: 'test@test.com', password: '', name: 'Test' }, field: 'password' },
    { body: { email: 'test@test.com', password: 'test123456', name: '' }, field: 'name' },
  ];

  for (const { body, field } of invalidBodies) {
    try {
      const res = await fetch(`${PROD}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      assert(res.status === 400, `${field} validation rejected (status ${res.status})`);
      console.log(`  📝 Empty ${field}: ${data.error}`);
    } catch (err: any) {
      assert(false, `${field} validation failed: ${err.message}`);
    }
  }

  // Test 5: Short password rejection
  console.log('\nTest 5: Short password rejection');
  try {
    const res = await fetch(`${PROD}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Password',
        email: `shortpw_${Date.now()}@test.com`,
        password: 'abc',
        displayName: 'Short',
        grade: 4,
        role: 'LEARNER',
      }),
    });
    const data = await res.json();
    
    assert(res.status === 400, `Short password rejected (status ${res.status})`);
    assert(data.error?.includes('8 characters') || data.error?.includes('password'), 'Error mentions password length');
    
    console.log(`  📝 Short password rejected: ${data.error}`);
  } catch (err: any) {
    assert(false, `Short password check failed: ${err.message}`);
  }

  // Test 6: Login with wrong password fails
  console.log('\nTest 6: Login with wrong password fails');
  try {
    const res = await fetch(`${PROD}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword123',
      }),
    });
    const data = await res.json();
    
    assert(res.status === 401, `Wrong password rejected (status ${res.status})`);
    
    console.log(`  📝 Wrong password rejected: ${data.error}`);
  } catch (err: any) {
    assert(false, `Wrong password check failed: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
