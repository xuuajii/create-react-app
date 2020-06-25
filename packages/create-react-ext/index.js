const execSync = require('child_process').execSync;
const npmVersion = execSync('npm --version').toString().trim();
console.log(npmVersion);
