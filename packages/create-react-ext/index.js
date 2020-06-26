const execSync = require('child_process').execSync;
const commander = require('commander');

packageJson = require('./package.json');
const program = new commander.Command(packageJson.name);
//program.option('-d --dev', 'is in dev mode')
program.parse(process.argv); //.parseOptions(process.argv)
console.log('program.dev');
// const instruction = {
//   command:'npx create-react-app',
//   appName: program.args[0],
//   template:  '--template extension'
//   scripts:program.args[1]==='dev'
// }

// try {
//   const extCreated = execSync(
//     `npx create-react-app ${program.args[0]} --template extension --scripts-version react-ext-scripts@0.0.0`,
//     { stdio: 'inherit' }
//   );
// } catch (err) {
//   console.log('app creation failed');
//   process.exit(1);
// }
