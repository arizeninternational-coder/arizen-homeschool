const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  'https://hgufndnqbvcukbxmwtvo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhndWZuZG5xYnZjdWtieG13dHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MTc2MDEsImV4cCI6MjA5NTA5MzYwMX0.RvIwZHU-kdGfrxEuHiCerqHWfUPhe5PlH67p6ti98Do' // anon key from .env
);

async function test() {
  const { data: users, error } = await supabase
    .from('User')
    .select('*')
    .eq('email', 'arizeninternational@gmail.com')
    .limit(1);

  if (error) { console.log('ERROR:', error.message); return; }
  if (!users || users.length === 0) { console.log('No user'); return; }

  const u = users[0];
  console.log('email:', u.email, 'role:', u.role);
  console.log('cols:', Object.keys(u));
  console.log('hash?', !!u.passwordHash, u.passwordHash?.substring(0,10));
  if (u.passwordHash) {
    console.log('valid bcrypt?', /^\$2[aby]\$\d+\$/.test(u.passwordHash));
    console.log('match?', await bcrypt.compare('demo123', u.passwordHash));
  }
}
test();
