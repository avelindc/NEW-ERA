const fs = require('fs');
let code = fs.readFileSync('src/app/LandingClient.tsx', 'utf-8');

code = code.replace(
  /<header className=\{`sticky top-0/g,
  '<header className={`fixed top-0 left-0 right-0'
);

fs.writeFileSync('src/app/LandingClient.tsx', code);
