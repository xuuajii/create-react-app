const execSync = require('child_process').execSync;
const npmVersion = execSync('npm --version');
console.log(npmVersion);
