const https = require('https');
const http = require('http');

async function checkUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      resolve({ url, status: res.statusCode, headers: res.headers });
    });
    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function main() {
  const urls = [
    'https://releases.breakoutmusicrecord.com/covers/cmu29m82w0003saevf4ahfo8t-1789456633739.jpeg',
    'https://releases.breakoutmusic.online/covers/cmu29m82w0003saevf4ahfo8t-1789456633739.jpeg',
    'https://releases.breakoutmusicrecord.com/audio/cmu29m82w0003saevf4ahfo8t-1789456654038.mp3',
    'https://releases.breakoutmusic.online/audio/cmu29m82w0003saevf4ahfo8t-1789456654038.mp3',
  ];
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(JSON.stringify(res));
  }
}
main();
