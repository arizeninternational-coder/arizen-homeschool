// Diagnostic script: access lesson page with JWT cookie
const http = require('http');
const fs = require('fs');

const token = fs.readFileSync('.dev_token', 'utf8').trim();

function makeRequest(pathname, method = 'GET', body = null) {
  const options = {
    hostname: '127.0.0.1',
    port: 3001,
    path: pathname,
    method: method,
    headers: {
      'Cookie': 'next-auth.session-token=' + token,
      'User-Agent': 'Mozilla/5.0',
    },
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    // 1. Check session
    const sessionRes = await makeRequest('/api/auth/session');
    console.log('=== SESSION ===');
    console.log('Status:', sessionRes.status);
    console.log('Body:', sessionRes.body.substring(0, 300));

    // 2. Try to access lesson page
    const lessonRes = await makeRequest('/dashboard/student/lessons/g4-mathematics/quest-g4-mathematics-whole-numbers/place-value');
    console.log('\n=== LESSON PAGE ===');
    console.log('Status:', lessonRes.status);
    console.log('Redirect:', lessonRes.headers.location || 'none');

    // Look for error indicators in the HTML
    if (lessonRes.body.includes('Something went wrong')) {
      console.log('ERROR FOUND: "Something went wrong" in HTML');
    }
    if (lessonRes.body.includes('place_value_chart')) {
      console.log('PlaceValueChart found in HTML');
    }
    if (lessonRes.body.includes('quick_check')) {
      console.log('quick_check found in HTML');
    }
    if (lessonRes.body.includes('multiple_choice')) {
      console.log('multiple_choice found in HTML');
    }
    if (lessonRes.body.includes('reflection_chips')) {
      console.log('reflection_chips found in HTML');
    }
    console.log('Body length:', lessonRes.body.length);
    console.log('Body (first 500 chars):', lessonRes.body.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
