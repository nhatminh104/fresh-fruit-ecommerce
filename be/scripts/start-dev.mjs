import http from 'node:http';
import { spawn } from 'node:child_process';

const port = Number(process.env.PORT || 5001);
const host = '127.0.0.1';

function checkExistingApi() {
  return new Promise((resolve) => {
    const request = http.get({ host, port, path: '/api/health', timeout: 1200 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          const payload = JSON.parse(body);
          resolve(response.statusCode === 200 && payload.success === true);
        } catch {
          resolve(false);
        }
      });
    });
    request.on('error', () => resolve(false));
    request.on('timeout', () => { request.destroy(); resolve(false); });
  });
}

const existingApi = await checkExistingApi();
if (existingApi) {
  console.log(`Fresh Fruit API is already running on ${host}:${port}; reusing it.`);
  process.exit(0);
}

const child = spawn(process.execPath, ['--watch', 'src/server.js'], { stdio: 'inherit' });
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child.kill(signal));
}
