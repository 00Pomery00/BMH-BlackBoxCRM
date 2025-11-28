const http = require('http');

function getJson(path) {
  return new Promise((resolve, reject) => {
    const opt = {
      hostname: 'localhost',
      port: 4001,
      path,
      method: 'GET',
      timeout: 5000,
    };
    const req = http.request(opt, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          reject(new Error('Invalid JSON response: ' + err.message));
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    req.end();
  });
}

(async () => {
  try {
    console.log('Checking GET /api/objects ...');
    const objs = await getJson('/api/objects');
    console.log('Status:', objs.status);
    console.log('Objects count:', Array.isArray(objs.body) ? objs.body.length : 'not-array');

    console.log('\nChecking GET /api/mock/users ...');
    const mock = await getJson('/api/mock/users');
    console.log('Status:', mock.status);
    console.log('Sample mock items:', Array.isArray(mock.body) ? mock.body.slice(0,3) : mock.body);
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
