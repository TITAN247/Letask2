const http = require('http');

// 1. Create a Mentee User first (if not exists, or use existing one)
// For this test, we'll try to login as a 'mentee' user but send role 'prementor'

const postData = JSON.stringify({
    email: 'testuser_verify@example.com', // Using the email from previous test
    password: 'Test@1234',
    role: 'prementor' // WRONG ROLE - Should fail
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
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();
