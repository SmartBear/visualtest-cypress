const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const package_json = require('./package.json');
const cwd = process.cwd();
const path = require("path");
const chalk = require('chalk')
require('dotenv').config();
const Jimp = require("jimp");

const pino = require('pino')
const logger = pino({transport: {target: 'pino-pretty'}});
logger.level = 'warn' ;// warn will be the default level for debug logs
//set debug flag on visualTest.config.js file by including: PINO_LOG_LEVEL: 'trace'
//options are [trace, debug, info, warn, error, fatal] in that order


let usersCypress;
try {
  const packageFile = fs.readFileSync(path.resolve(path.dirname(require.resolve('cypress', {paths: [cwd]})), 'package.json'))
  usersCypress = JSON.parse(packageFile.toString());
  if (!usersCypress.version) {
    usersCypress.version = "10.0.0.failure"
    logger.warn('failed to find cypress assuming it is v10+')
  }
} catch (err) {
  logger.warn("catch")
  usersCypress.version = "10.0.0"
  console.log(err)
  logger.warn(err.message)
}

let env, host, webUrl, cdnUrl;
let configFile = (() => {
  try {
    let config = {}
    const fileName = 'visualTest.config.js';
    const fullPath = `${process.cwd()}/${fileName}`;
    if (fs.existsSync(fullPath)) {
      logger.trace(fileName + ' has been found');
      config = {...require(fullPath)}; //write the VT config file into config object

      env = (config.VT_ENV || process.env.VT_ENV || 'PROD').toUpperCase();

      if (env === "PROD") {
        host = "https://api.visualtest.io";
        webUrl = "https://app.visualtest.io";
        cdnUrl = "https://cdn.visualtest.io/browser-toolkit";
      }
      else if (env === "DEV") {
        host = "https://api.dev.visualtest.io";
        webUrl = "https://app.dev.visualtest.io";
        cdnUrl = "https://cdn.dev.visualtest.io/browser-toolkit";
      }
      else if (env === "INT") {
        host = "https://api.int.visualtest.io";
        webUrl = "https://app.int.visualtest.io";
        cdnUrl = "https://cdn.int.visualtest.io/browser-toolkit";
      }
      else {
        logger.warn(`Invalid VT_ENV param: ${env}. Please use DEV or INT. Defaulting to PROD`);
        host = "https://api.visualtest.io"
        webUrl = "https://app.visualtest.io"
        cdnUrl = "https://cdn.visualtest.io/browser-toolkit"
      }

      config.cdnUrl = cdnUrl
      return config;
    } else {
      config.fail = true;
      logger.fatal('The path ' + fullPath + ' was not found');
      return config;
    }
  } catch (e) {
    console.log(e)
  }
})();

let getDomCapture = (async () => {
  try {
    const domCapture = await axios.get(`${configFile.cdnUrl}/dom-capture.min.js`)
    return domCapture.data
  } catch (error) {
    configFile.fail = true;
    logger.fatal(`Error with grabbing getDomCapture: %o`, error.message);
  }
})();

let getUserAgent = (async () => {
  try {
    const domCapture = await axios.get(`${configFile.cdnUrl}/user-agent.min.js`)
    return domCapture.data
  } catch (error) {
    configFile.fail = true;
    logger.fatal(`Error with grabbing getUserAgent: %o`, error.message);
  }
})();

let domToolKit = null
Promise.all([getDomCapture, getUserAgent]).then((values) => {
  const data = {}
  data.domCapture = values[0]
  data.userAgent = values[1]
  domToolKit = data
});

function makeGlobalRunHooks() {
  return {
    'task': {
      async postTestRunId (userAgent) { //cy.task('postTestRunId') to run this code
        if (!configFile.testRunId && !configFile.fail) {//all this only needs to run once
          const sessionId = uuidv4();
          try {
            //Create file for BitBar to grab sessionId
            fs.writeFileSync('./node_modules/@smartbear/visualtest-cypress/sessionId.txt', sessionId)
          } catch (error) {
            //In case of an error do not want to throw an error
            logger.info("FOR BitBar——issue creating the sessionId file: %o", error)
          }

          if (configFile.PINO_LOG_LEVEL) {
            logger.level = configFile.PINO_LOG_LEVEL //overwrite if the user includes a pino flag in VTconf
          } else if (configFile.log) {
            logger.level = configFile.log
          }

          if (!configFile.projectToken) { //check to make sure user added a projectToken
            configFile.fail = true;
            logger.fatal(`Please add **module.exports = { projectToken: 'PROJECT_TOKEN' }** to your visualTest.config.js file`);
            return configFile;
          }

          if (configFile.projectToken.includes("_")) { //check to make sure the user changed it from the default
            configFile.fail = true;
            logger.fatal(`Please insert your actual projectToken`);
            return configFile;
          }

          if (!configFile.projectToken.split('/')[1]) { //check to make sure user added the auth part(~second-half) of projectToken
            configFile.fail = true;
            logger.fatal(`Please add your full projectToken for example -> ** projectToken: 'xxxxxxxx/xxxxxxxxxxxx' **`);
            return configFile;
          }

          logger.trace('config.projectToken: ' + configFile.projectToken);
          configFile.projectId = configFile.projectToken.split('/')[0]; //take the first ~half to get the projectId
          logger.trace('config.projectId: ' + configFile.projectId);

          axios.defaults.headers.common['Authorization'] = `Bearer ${configFile.projectToken}`;
          logger.trace(`axios.defaults.headers.common['Authorization']: ` + axios.defaults.headers.common['Authorization']);

          configFile.sessionId = sessionId;
          logger.trace('config.sessionId: ' + configFile.sessionId);

          if (!configFile.testRunName) {  //if testRunName not defined---use device / browser
            let osPrettyName;
            if (userAgent.osName === 'macos') {
              osPrettyName = 'macOS';
            } else {
              const str = userAgent.osName;
              osPrettyName = str.charAt(0).toUpperCase() + str.slice(1);
            }
            const str = userAgent.browserName;
            const browserPrettyName = str.charAt(0).toUpperCase() + str.slice(1);

            const browserMajorVersion = userAgent.browserVersion.split('.');
            configFile.testRunName = `${osPrettyName} ${userAgent.osVersion} / ${browserPrettyName} ${browserMajorVersion[0]}`;
          }
          logger.trace('config.testRunName: ' + configFile.testRunName);

          configFile.url = host;
          configFile.websiteUrl = webUrl;
          if (env !== "PROD") {
            logger.warn('VT_ENV: ' + env);
          } else {
            logger.trace('environment is: ' + env);
          }

          configFile.cypressVersion = usersCypress.version
          try {
            const postResponse = await axios.post(`${configFile.url}/api/v1/projects/${configFile.projectId}/testruns`, {
              testRunName: configFile.testRunName,
              sdk: 'cypress',
              sdkVersion: `${package_json.version}/c${usersCypress.version}`
            })
            configFile.testRunId = postResponse.data.testRunId;
            logger.debug('config.testRunId: ' + configFile.testRunId);
          } catch (error) {
            configFile.fail = true;
            logger.fatal(`Error with creating testRun: %o`, error.message);
            logger.trace(`Full error with creating testRun: %o`, error);
            return configFile;
          }
          configFile.fail = false; //no errors in generating testRunId
          logger.trace('—————————————————Successfully created a testRunId—————————————————');
        }
        return configFile;
      },
      async lazyStitch ({imageName, lazyLoadedPath, pageHeight, viewportWidth, viewportHeight}) {
        const folderPath = lazyLoadedPath.substring(0, lazyLoadedPath.lastIndexOf(path.sep));
        const files = fs.readdirSync(folderPath);
        logger.info(`inside lazyStitch()——imageName: ${imageName}, pageHeight: ${pageHeight}, viewportWidth: ${viewportWidth}, viewportHeight: ${viewportHeight}, ${files.length} images.`)

        //create the new blank fullpage image
        const newImage = new Jimp(viewportWidth, pageHeight);

        //crop the last image
        const toBeCropped = (files.length*viewportHeight)-pageHeight
        if (viewportHeight-toBeCropped < 0) { //error handling in commands.js should prevent this from ever reaching
          logger.warn(`lazyLoadedPath: ${lazyLoadedPath}`)
          logger.warn(`imageName: ${imageName}, lazyLoadedPath: ${lazyLoadedPath}, pageHeight: ${pageHeight}, viewportWidth: ${viewportWidth}, viewportHeight: ${viewportHeight}`)
          logger.warn(`toBeCropped:${toBeCropped}, viewportHeight-toBeCropped:${viewportHeight-toBeCropped}`)
          return "error"
        }
        logger.debug(`files.length:${files.length}, viewportHeight:${viewportHeight}, pageHeight:${pageHeight}, toBeCropped:${(files.length*viewportHeight)-pageHeight} ((files.length*viewportHeight)-pageHeight)`)
        logger.debug(`calculations of what last image should be - viewportWidth:${viewportWidth} x height:${viewportHeight-toBeCropped} (viewportHeight-toBeCropped)`)
        const bottomImage = await Jimp.read(`${folderPath}/${files.length-1}.png`);
        logger.debug(`raw last image width:${bottomImage.bitmap.width} x height:${bottomImage.bitmap.height}`)
        bottomImage.resize(viewportWidth, Jimp.AUTO) //resize (causes issue with retina display)
        logger.debug(`resized last image width:${bottomImage.bitmap.width} x height:${bottomImage.bitmap.height}`)
        bottomImage.crop(0, 0, viewportWidth, viewportHeight-toBeCropped)
        logger.debug(`cropped last image width:${bottomImage.bitmap.width} x height:${bottomImage.bitmap.height}`)
        bottomImage.write(`${folderPath}/${files.length-1}.png`); //overwrite the file

        //stitch the images all together
        for (let i = 0; i < files.length; i++) {
          const image = await Jimp.read(`${folderPath}/${i}.png`);
          image.resize(viewportWidth, Jimp.AUTO); //resize (causes issue with retina display)
          logger.trace(`blit ${i+1}/${files.length}`)
          newImage.blit(image, 0, viewportHeight * i)
        }

        // remove the old viewport images
        const deleteFolder = `${folderPath.substring(0, folderPath.lastIndexOf(path.sep))}`;
        fs.rmSync(deleteFolder, { recursive: true, force: true });
        logger.debug(`removed the folder at: ${deleteFolder}`)

        // write the new image to the users screenshot folder
        const userPath = `${deleteFolder.substring(0, deleteFolder.lastIndexOf(path.sep))}/${imageName}.png`;
        newImage.write(userPath)
        logger.debug(`new stitched image has been written at: ${userPath}`)
        return {
          height: newImage.bitmap.height,
          width: newImage.bitmap.width,
          path: userPath
        }
      },
      async logger ({type, message}) { //this task is for printing logs to node console from the custom command
        type === 'fatal'  ? logger.fatal(message) :
            type === 'error'  ? logger.error(message) :
                type === 'warn'   ? logger.warn(message)  :
                    type === 'info'   ? logger.info(message)  :
                        type === 'debug'  ? logger.debug(message) :
                            type === 'trace'  ? logger.trace(message) :
                                logger.warn('error with the logger task')
        return null
      },
      getToolkit () {
        return domToolKit;
      },
      readFile(filename) {
        // this is a task incase the file is not found.... https://docs.cypress.io/api/commands/task#Read-a-file-that-might-not-exist
        if (fs.existsSync(filename)) {
          return fs.readFileSync(filename, 'utf8')
        }
        return null
      },
    },
    'after:run':
        async () => {
          if (configFile.fail === false) {
            try {
              const imageResponse = await axios.get(`${configFile.url}/api/v1/projects/${configFile.projectId}/testruns/${configFile.testRunId}/images`);

              const imageCount = imageResponse.data.page.totalItems;

              process.stdout.write(`View your ${imageCount} ${(imageCount === 1 ? 'capture' : 'captures')} here: `);
              console.log(chalk.blue(`${configFile.websiteUrl}/projects/${configFile.projectId}/testruns/${configFile.testRunId}/comparisons`));

              function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
              }

              let comparisonResponse;
              let comparisonTotal = 0;
              for (let i = 0; comparisonTotal !== imageCount && i < 40; i++) { //wait 10 seconds before timeout
                if (i > 0) {//don't wait the first iteration
                  await sleep(250)
                  process.stdout.write("\r\x1b[K");
                }
                const state = i % 5 === 0 ? "" : i % 5 === 1 ? "." : i % 5 === 2 ? ".." : i % 5 === 3 ? "..." : "...."
                process.stdout.write(chalk.magenta(`\tloading the VisualTest comparison data${state}`))
                comparisonResponse = await axios.get(`${configFile.url}/api/v1/projects/${configFile.projectId}/testruns/${configFile.testRunId}?expand=comparison-totals`);
                comparisonTotal = comparisonResponse.data.comparisons.total;
              }
              process.stdout.write("\r\x1b[K");
              let comparisonResult = comparisonResponse.data.comparisons;

              if (comparisonResult.new_image) console.log(chalk.yellow(`\t${comparisonResult.new_image} new base ${comparisonResult.new_image === 1 ? 'image' : 'images'}`));
              if (comparisonResult.failed) console.log(chalk.red(`\t${comparisonResult.failed} image comparison ${comparisonResult.failed === 1 ? 'failure' : 'failures'} to review`));
              if (comparisonResult.passed) console.log(chalk.green(`\t${comparisonResult.passed} image ${comparisonResult.passed === 1 ? 'comparison' : 'comparisons'} passed`));
              if (comparisonTotal !== imageCount) console.log(chalk.magenta('\tComparison results are still in pending state, get up to date results on VisualTest website.'));

            } catch (error) {
              console.error(error);
            }
          } else if (configFile.fail === true) {
            logger.fatal('There were issues with VisualTest. Check above logs.');
          } else {
            console.log('There were no VisualTest captures taken.');
          }
        },
  };
}

function makePluginExport() {
  let setupNodeEventState = false;
  return function pluginExport(pluginModule) {
    if (pluginModule.exports.e2e && pluginModule.exports.e2e.setupNodeEvents) {
      setupNodeEventState = true; //for not throwing an error if the user doesn't have setupNodeEvents SBVT-335

    }
    const pluginModuleExports = pluginModule.exports.e2e
        ? pluginModule.exports.e2e.setupNodeEvents
        : pluginModule.exports;
    const setupNodeEvents = async function(...args) {
      const globalHooks = makeGlobalRunHooks();
      const [origOn] = args;

      for (const [eventName, eventHandler] of Object.entries(globalHooks)) { // for-loop to add all functions on this file
        origOn.call(this, eventName, eventHandler);
      }
      if (setupNodeEventState) {
        //Needed for grabbing functions in cypress.config.js file
        await pluginModuleExports(grabUserFunctions);
      }
      function grabUserFunctions(eventName, handler) {//Needed for grabbing functions in cypress.config.js file
        return origOn.call(this, eventName, handler);
      }
    };
    if (pluginModule.exports.e2e) {
      pluginModule.exports.e2e.setupNodeEvents = setupNodeEvents;
    } else {
      pluginModule.exports = setupNodeEvents;
    }
  };
}

module.exports = makePluginExport({});
