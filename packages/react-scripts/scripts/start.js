// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');
// @remove-on-eject-begin
// Do the preflight check (only happens before eject).
const verifyPackageTree = require('./utils/verifyPackageTree');
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');
verifyTypeScriptSetup();

const verifyExtTree = require('./utils/verifyExtTree');
verifyExtTree();
// @remove-on-eject-end

const fs = require('fs-extra');
const _ = require('lodash');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const paths = require('../config/paths');
const glob = require('glob');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');
const path = require('path');
const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

if (paths.appPath.match(/Documents\\Qlik\\Sense\\Extensions/g)) {
  console.log(
    chalk.yellow(
      'The extension is supposed to be served inside Qlik Sense Desktop extensions directory. Other configurations are not supported'
    )
  );
}

// Tools like Cloud9 rely on this.
const appName = require(paths.appPackageJson).name;
const HOST = process.env.HOST || 'localhost';
if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://cra.link/advanced-config')}`
  );
  console.log();
}

const readPort = () => {
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
const DEFAULT_PORT = readPort();

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return;
    }
    //console.log(port)
    const config = configFactory('development');
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    const devSocket = {
      warnings: warnings =>
        devServer.sockWrite(devServer.sockets, 'warnings', warnings),
      errors: errors =>
        devServer.sockWrite(devServer.sockets, 'errors', errors),
    };
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName,
      config,
      devSocket,
      urls,
      useYarn,
      useTypeScript,
      tscCompileOnError,
      webpack,
    });
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(
      proxySetting,
      paths.appPublic,
      paths.publicUrlOrPath
    );
    // Check if a build version already exists and backup its qext to avoid conflicts.
    // Prepare a callback to restore previous versions when exit
    const qExtPath = path.resolve(path.join(paths.appBuild, appName + '.qext'));
    const qExtExists = fs.existsSync(qExtPath);
    const qExtBckPath = qExtPath.replace('qext', 'bck');
    const onExit = () => {
      const qExtBckExists = fs.existsSync(qExtBckPath);
      if (qExtBckExists) {
        console.log(`Restoring qExt file in build folder...`);
        console.log();
        fs.renameSync(qExtBckPath, qExtPath);
        console.log();
        console.log('qExt restored');
      }
    };
    if (qExtExists) {
      fs.renameSync(qExtPath, qExtBckPath);
      console.log('Found a build version, backupping qExt file');
    }

    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    );
    const devServer = new WebpackDevServer(compiler, serverConfig);
    // Launch WebpackDevServer.
    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err);
      }
      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('Starting the development server...\n'));

      const prepareQlikUrl = () => {
        const firstAppinFolder = _.last(
          glob.sync(paths.qlikAppsPath + '/*.qvf')[0].split('/')
        );
        const DEFAULT_QLIK_APP = process.env.QLIK_APP_NAME || firstAppinFolder;
        if (!process.env.QLIK_APP_NAME) {
          console.log(
            chalk.cyan(
              'No QLIK_APP_NAME was provided, opening ' + firstAppinFolder
            )
          );
        }
        const browserAppsPath =
          paths.qlikAppsPath.replace(':', '%3A').replace(/\\/g, '%5C') + '%5C';
        const sheetPath = process.env.QLIK_SHEET_ID
          ? 'sheet/' + process.env.QLIK_SHEET_ID
          : '';
        return (
          'http://' +
          HOST +
          ':4848/sense/app/' +
          browserAppsPath +
          DEFAULT_QLIK_APP +
          '/' +
          sheetPath
        );
      };
      const qlikUrl = prepareQlikUrl();
      openBrowser(qlikUrl);
    });

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        onExit();
        devServer.close();
        process.exit();
      });
    });

    if (process.env.CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function () {
        onExit();
        devServer.close();
        process.exit();
      });
    }
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
