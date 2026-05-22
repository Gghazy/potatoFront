// Wipes everything from the backend's wwwroot EXCEPT the `uploads` folder
// so prod Angular builds get a clean output without losing user-uploaded files.
// Runs before `ng build --configuration production` via the npm `build:prod` script.

const fs = require('fs');
const path = require('path');

const PRESERVE = new Set(['uploads']);
const target = path.resolve(__dirname, '../../backend/src/PotatoAccounting.Api/wwwroot');

if (!fs.existsSync(target)) {
  fs.mkdirSync(target, { recursive: true });
  process.exit(0);
}

for (const name of fs.readdirSync(target)) {
  if (PRESERVE.has(name)) continue;
  fs.rmSync(path.join(target, name), { recursive: true, force: true });
}
