/**
 * Simple script to register a user
 * Usage: node register-user.js [username] [password]
 */

const http = require('http');

const username = process.argv[2] || 'testuser';
const password = process.argv[3] || 'password123';

const data = JSON.stringify({
  username,
  password,
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(responseData);
      console.log('Response:', JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n✅ User registered successfully!');
        console.log('Token:', json.token);
        console.log('\nYou can now login with:');
        console.log('Username:', username);
        console.log('Password:', password);
      } else {
        console.log('\n❌ Registration failed:', json.message);
      }
    } catch (err) {
      console.log('Raw response:', responseData);
      console.error('Error parsing response:', err.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\nMake sure the backend server is running on port 3000');
});

req.write(data);
req.end();

