const test = async () => {
  try {
    const email = `test${Date.now()}@example.com`;
    const resReg = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email, password: 'password123' })
    });
    
    const cookies = resReg.headers.get('set-cookie');
    
    const resAnalytics = await fetch('http://localhost:5000/api/analytics', {
      headers: { Cookie: cookies || '' }
    });
    
    const data = await resAnalytics.json();
    console.log('Analytics Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

test();
