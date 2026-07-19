import axios from 'axios';

async function test() {
  try {
    const ts = Date.now();
    // Register
    await axios.post('http://localhost:8080/api/v1/auth/register', {
      email: `test${ts}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: 'Password123!',
      phoneNumber: '1234567890',
      gender: 'Male',
      username: `testuser${ts}`
    });

    console.log('Registered successfully');

    // Login
    const loginRes = await axios.post('http://localhost:8080/api/v1/auth/login', {
      email: `test${ts}@example.com`,
      password: 'Password123!'
    });
    console.log('Login Response Keys:', Object.keys(loginRes.data));
    console.log('Access Token exists:', !!loginRes.data.accessToken);
    console.log('Refresh Token exists:', !!loginRes.data.refreshToken);
    console.log('User exists in login:', loginRes.data.user !== undefined);

    // Refresh
    const refreshRes = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
      refreshToken: loginRes.data.refreshToken
    });
    console.log('Refresh Response Keys:', Object.keys(refreshRes.data));

  } catch (err: any) {
    console.log('Error:', err.response?.data || err.message);
  }
}

test();
