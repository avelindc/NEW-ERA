const https = require('https');

async function testUrl(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      resolve({ url, status: res.statusCode });
    }).on('error', e => resolve({ url, error: e.message }));
  });
}

async function main() {
  const urls = [
    'https://assets.breakoutmusicrecord.com/cms/0aee3d96-fe3e-4e9e-ad61-630efed4cad6.jpg',
    'https://assets.breakoutmusic.online/cms/0aee3d96-fe3e-4e9e-ad61-630efed4cad6.jpg',
    'https://assets.breakoutmusicrecord.com/covers/cmu29m82w0003saevf4ahfo8t-1789453944731.jpg',
    'https://releases.breakoutmusicrecord.com/covers/cmu29m82w0003saevf4ahfo8t-1789456633739.jpeg',
    'https://releases.breakoutmusic.online/covers/cmrs5lqe50005dngs75e2u0o3-1789450979619.jpg',
    'https://releases.breakoutmusicrecord.com/covers/cmrs5lqe50005dngs75e2u0o3-1789450979619.jpg'
  ];
  for (const u of urls) {
    const res = await testUrl(u);
    console.log(res);
  }
}
main();
