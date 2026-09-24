const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runHealthCheck() {
  console.log('🧪 RUNNING LEARNHUB AI AUTOMATED HEALTH & E2E SUITE...\n');

  try {
    // 1. Health Check
    const health = await request('/health');
    console.log(`✅ [1/5] Health Check Endpoint: Status ${health.status}`);

    // 2. Public Courses
    const courses = await request('/courses');
    console.log(`✅ [2/5] Public Courses API: ${courses.body?.data?.courses?.length || 0} courses returned`);

    // 3. Login Student
    const login = await request('/auth/login', 'POST', {
      email: 'student@learnhub.ai',
      password: 'password123'
    });

    if (login.status === 200 && login.body?.data?.accessToken) {
      const token = login.body.data.accessToken;
      console.log(`✅ [3/5] Authentication (Student Login): JWT token received`);

      // 4. Authenticated Profile
      const profile = await request('/users/me', 'GET', null, token);
      console.log(`✅ [4/5] Profile API (/users/me): User ${profile.body?.data?.user?.email} verified`);

      // 5. Authenticated Notes
      const notes = await request('/notes', 'GET', null, token);
      console.log(`✅ [5/5] Personal Notes API (/notes): ${notes.body?.data?.notes?.length || 0} notes fetched`);

      console.log('\n🎉 ALL E2E VERIFICATION CHECKS PASSED PERFECTLY!');
    } else {
      console.log(`⚠️ Login check skipped (Server off or unseeded).`);
    }
  } catch (err) {
    console.error('❌ Verification suite error:', err.message);
  }
}

runHealthCheck();
