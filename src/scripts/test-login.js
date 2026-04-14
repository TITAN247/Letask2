const http = require('http');

const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    role: 'mentee'
});

const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', e => console.error(e));
req.write(postData);
req.end();
