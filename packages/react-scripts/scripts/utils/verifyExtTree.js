const paths = require('../../config/paths');
const fs = require('fs-extra');
const chalk = require('react-dev-utils/chalk');
const path = require('path');
const verifyExtTree = () => {
  const appName = require(paths.appPackageJson).name;
  const fileExtensions = ['js', 'qext'];
  fileExtensions.forEach(fe => {
    const filePath = path.join(paths.appPublic, appName + '.' + fe);
    const fileExists = fs.pathExistsSync(filePath);
    if (!fileExists) {
      console.error(
        chalk.red(
          'Missing ' +
            appName +
            '.' +
            fe +
            ' in ' +
            paths.appPublic +
            ' please create the file and rerun the script'
        )
      );
      process.exit(1);
    }
  });
};

module.exports = verifyExtTree;
