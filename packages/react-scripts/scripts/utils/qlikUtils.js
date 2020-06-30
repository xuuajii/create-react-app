const path = require('path');
const paths = require('../../config/paths');
const fs = require('fs-extra');
const _ = require('lodash');
const glob = require('glob');
const chalk = require('react-dev-utils/chalk');

module.exports.readPort = HOST => {
  const appName = require(paths.appPackageJson).name;
  const extFilePath = path.join(paths.appPublic, appName + '.js');
  const extFileContent = fs.readFileSync(extFilePath).toString();
  const regExpMatch = "'(?:https|http)://" + HOST + ":\\d{4,}/bundle\\.js'";
  const regexp = new RegExp(regExpMatch);
  const matches = extFileContent.match(regexp);

  if (matches === null || matches.length < 1) {
    console.log('no port found, please check ' + extFilePath);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.log(
      'extracted more than one port from ' + extFilePath + '. Using the first'
    );
  }
  if (matches.length) {
    const match = _.uniq(
      extFileContent.match(regexp).map(match => {
        const cleansedMatch = match
          .match(/:\d{4,}\//)[0]
          .replace(':', '')
          .replace('/', '');
        return cleansedMatch;
      })
    )[0];
    return Number(match);
  }
};

module.exports.prepareQlikUrl = HOST => {
  const firstAppinFolder = _.last(
    glob.sync(paths.qlikAppsPath + '/*.qvf')[0].split('/')
  );
  const DEFAULT_QLIK_APP = process.env.QLIK_APP_NAME || firstAppinFolder;
  if (!process.env.QLIK_APP_NAME) {
    console.log(
      chalk.cyan('No QLIK_APP_NAME was provided, opening ' + firstAppinFolder)
    );
  }
  const browserAppsPath =
    paths.qlikAppsPath.replace(':', '%3A').replace(/\\/g, '%5C') + '%5C';
  const sheetPath = process.env.QLIK_SHEET_ID
    ? 'sheet/' + process.env.QLIK_SHEET_ID
    : '';
  const url =
    'http://' +
    HOST +
    ':4848/sense/app/' +
    browserAppsPath +
    DEFAULT_QLIK_APP +
    '/' +
    sheetPath;
  //console.log(url)
  return url;
};

module.exports.verifyExtTree = () => {
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
          `Template js file has been changed. This is not supported and can cause unexpected behaviour.
Template file path is: ${filePath}.
          `
        )
      );
    }
  };
};
