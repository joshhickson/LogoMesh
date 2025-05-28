
const http = require('http');

// Simple test to verify backup endpoint
const testBackup = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/admin/backup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Backup API Response:', JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    console.error('Error testing backup API:', error);
  });

  req.end();
};

console.log('Testing backup API endpoint...');
testBackup();
