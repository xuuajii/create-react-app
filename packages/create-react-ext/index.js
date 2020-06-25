const execSync = require('child_process').execSync;
const commander = require('commander');

packageJson = require('./package.json');
const program = new commander.Command(packageJson.name).parse(process.argv);
console.log(program.args[0]);

try {
  const extCreated = execSync(
    `npx create-react-app ${program.args[0]} --template extension`,
    { stdio: 'inherit' }
  );
} catch (err) {
  console.log('app creation failed');
  process.exit(1);
}
console.clear();
try {
  const extCreated = execSync(`npm uninstall react-scripts`, {
    stdio: 'inherit',
  });
} catch (err) {
  console.log('failed to uninstall react-scripts');
  process.exit(1);
}

try {
  const extCreated = execSync(`npm install react-ext-scripts`, {
    stdio: 'inherit',
  });
  console.log('initializtion completed');
} catch (err) {
  console.log('failed to install react-ext-scripts');
  process.exit(1);
}
