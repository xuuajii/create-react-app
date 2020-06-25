const execSync = require('child_process').execSync;
const extCreated = execSync(
  'npx create-react-app my-ext --template extension',
  { stdio: 'inherit' }
);
