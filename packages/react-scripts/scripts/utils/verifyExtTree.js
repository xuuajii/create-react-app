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
      if (fe === 'js') {
        checkExtFile(filePath);
      }
      process.exit(1);
    }
  });
  const checkExtFile = filePath => {
    const templateDef = fs
      .readFileSync(
        '../../node_modules/cra-template-extension/template/public/react-ext-scripts.js'
      )
      .toString()
      .trim();
    const fileContent = fs.readFileSync(filePath).toString().trim();
    if (templateDef !== fileContent) {
      console.log(
        chalk.yellow(
          'Template js file has been changed. This is not supported and can cause unexpected behaviour.'
        )
      );
    }
  };
};

module.exports = verifyExtTree;
