const execSync = require('child_process').execSync;
const commander = require('commander');

packageJson = require('./package.json');
const program = new commander.Command(packageJson.name).parse(process.argv);
console.log(program.args[0]);

const extCreated = execSync(
  `npx create-react-app ${program.args[0]} --template extension`,
  { stdio: 'inherit' }
);
