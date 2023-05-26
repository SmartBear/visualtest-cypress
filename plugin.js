const axios = require('axios').default;
const {v4: uuidv4} = require('uuid');
const fs = require("fs");
const package_json = require('./package.json');
const cwd = process.cwd();
const path = require("path");
const chalk = require('chalk');
require('dotenv').config();
const Jimp = require("jimp");
const os = require('os');
const pino = require('pino');
const logger = pino({transport: {target: 'pino-pretty'}});
logger.level = 'warn';// warn will be the default level for debug logs
//set debug flag on visualTest.config.js file by including: PINO_LOG_LEVEL: 'trace'
//options are [trace, debug, info, warn, error, fatal] in that order

let usersCypress, env, host, webUrl, cdnUrl;


try {
    const packageFile = fs.readFileSync(path.resolve(path.dirname(require.resolve('cypress', {paths: [cwd]})), 'package.json'));
    usersCypress = JSON.parse(packageFile.toString());
    if (!usersCypress.version) {
        usersCypress.version = "10.0.0.failure";
        logger.warn('failed to find cypress assuming it is v10+');
    }
} catch (err) {
    logger.warn("catch");
    usersCypress.version = "10.0.0";
    console.log(err);
    logger.warn(err.message);
}

let setEnv = (projectToken) => {
    if (projectToken && projectToken.split('_')[1] && projectToken.includes("/")) {
        //check if the projectToken is environmented, and not to throw any errors here if user messes up, error later
        env = projectToken.split('_')[1].toLowerCase();
    }
    if (env) {
        logger.warn(`overwritten env is: ${env}`);
        host = `https://api.${env}.visualtest.io`;
        webUrl = `https://app.${env}.visualtest.io`;
        cdnUrl = `https://cdn.${env}.visualtest.io/browser-toolkit`;
    } else {
        host = "https://api.visualtest.io";
        webUrl = "https://app.visualtest.io";
        cdnUrl = "https://cdn.visualtest.io/browser-toolkit";
    }
};

let configFile = (() => {
    try {
        let config = {};
        const fileName = 'visualTest.config.js';
        const fullPath = `${process.cwd()}/${fileName}`;
        if (fs.existsSync(fullPath)) {
            logger.trace(fileName + ' has been found');
            config = {...require(fullPath)}; //write the VT config file into config object


            if (config.projectToken) {
                //dont throw error if missing projectToken in visualtest.config.js——default to prod
                setEnv(config.projectToken);
            }
            config.cdnUrl = cdnUrl || "https://cdn.visualtest.io/browser-toolkit";

            return config;
        } else {
            config.fail = true;
            logger.fatal('The path ' + fullPath + ' was not found');
            return config;
        }
    } catch (e) {
        console.log(e);
    }
})();

let getDomCapture = (async () => {
    try {
        const domCapture = await axios.get(`${configFile.cdnUrl}/dom-capture.min.js`);
        return domCapture.data;
    } catch (error) {
        configFile.fail = true;
        logger.fatal(`Error with grabbing domCapture: %o`, error.message);
    }
})();

let getUserAgent = (async () => {
    try {
        const userAgent = await axios.get(`${configFile.cdnUrl}/user-agent.min.js`);
        return userAgent.data;
    } catch (error) {
        configFile.fail = true;
        logger.fatal(`Error with grabbing userAgent: %o`, error.message);
    }
})();

let getFreezePage = (async () => {
    try {
        const freezePage = await axios.get(`${configFile.cdnUrl}/freeze-page.min.js`);
        return freezePage.data;
    } catch (error) {
        configFile.fail = true;
        logger.fatal(`Error with grabbing freezePage: %o`, error.message);
    }
})();

let domToolKit = null;
Promise.all([getDomCapture, getUserAgent, getFreezePage]).then((values) => {
    const data = {};
    data.domCapture = values[0];
    data.userAgent = values[1];
    data.freezePage = values[2];
    domToolKit = data;
});

function makeGlobalRunHooks() {
    return {
        'task': {
            async postTestRunId(fromCommands) { //cy.task('postTestRunId') to run this code
                if (!configFile.testRunId && !configFile.fail) {//all this only needs to run once
                    const sessionId = uuidv4();
                    try {
                        //Create file for BitBar to grab sessionId
                        fs.writeFileSync('./node_modules/@smartbear/visualtest-cypress/sessionId.txt', sessionId);
                    } catch (error) {
                        //In case of an error do not want to throw an error
                        logger.info("FOR BitBar——issue creating the sessionId file: %o", error);
                    }

                    if (configFile.PINO_LOG_LEVEL) {
                        logger.level = configFile.PINO_LOG_LEVEL; //overwrite if the user includes a pino flag in VTconf
                    } else if (configFile.log) {
                        logger.level = configFile.log;
                    }

                    if (fromCommands.envFromCypress.projectToken) {
                        logger.info('PROJECT_TOKEN found in env flag from Cypress');
                        setEnv(fromCommands.envFromCypress.projectToken);
                        configFile.projectToken = fromCommands.envFromCypress.projectToken;
                    } else if (process.env.PROJECT_TOKEN) {
                        logger.info('PROJECT_TOKEN found in env variable');
                        setEnv(process.env.PROJECT_TOKEN);
                        configFile.projectToken = process.env.PROJECT_TOKEN;
                    } else {
                        if (!configFile.projectToken) { //check to make sure user added a projectToken
                            configFile.fail = true;
                            logger.fatal(`Please add **module.exports = { projectToken: 'PROJECT_TOKEN' }** to your visualTest.config.js file`);
                            return configFile;
                        }

                        if (configFile.projectToken.includes("PROJECT_TOKEN")) { //check to make sure the user changed it from the default
                            configFile.fail = true;
                            logger.fatal(`Please insert your projectToken. If you don't have an account, start a free trial: https://try.smartbear.com/visualtest`);
                            return configFile;
                        }
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
                    axios.defaults.headers.common['sbvt-client'] = 'sdk';
                    axios.defaults.headers.common['sbvt-sdk'] = `cypress`;
                    axios.defaults.headers.common['sbvt-sdk-version'] = package_json.version;
                    logger.trace(`axios.defaults.headers.common['Authorization']: ` + axios.defaults.headers.common['Authorization']);

                    configFile.sessionId = sessionId;
                    logger.trace('config.sessionId: ' + configFile.sessionId);

                    if (fromCommands.envFromCypress.testRunName) {
                        logger.info('TEST_RUN_NAME found in env flag from Cypress');
                        configFile.testRunName = fromCommands.envFromCypress.testRunName;
                    } else if (process.env.TEST_RUN_NAME) {
                        logger.info('TEST_RUN_NAME found in env variable');
                        configFile.testRunName = process.env.TEST_RUN_NAME;
                    } else if (!configFile.testRunName) {
                        //if testRunName not defined---use device / browser
                        let osPrettyName;
                        if (fromCommands.userAgentData.osName === 'macos') {
                            osPrettyName = 'macOS';
                        } else {
                            const str = fromCommands.userAgentData.osName;
                            osPrettyName = str.charAt(0).toUpperCase() + str.slice(1);
                        }
                        const str = fromCommands.userAgentData.browserName;
                        const browserPrettyName = str.charAt(0).toUpperCase() + str.slice(1);

                        const browserMajorVersion = fromCommands.userAgentData.browserVersion.split('.');
                        configFile.testRunName = `${osPrettyName} / ${browserPrettyName} ${browserMajorVersion[0]}`;
                    }
                    logger.trace('config.testRunName: ' + configFile.testRunName);

                    configFile.url = host;
                    configFile.websiteUrl = webUrl;

                    configFile.cypressVersion = usersCypress.version;
                    try {
                        const postResponse = await axios.post(`${configFile.url}/api/v1/projects/${configFile.projectId}/testruns`, {
                            testRunName: configFile.testRunName,
                            sdk: 'cypress',
                            sdkVersion: `${package_json.version}/c${usersCypress.version}`
                        });
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
            async stitchImages({imageName, imagesPath, pageHeight, viewportWidth, viewportHeight}) {
                const folderPath = imagesPath.substring(0, imagesPath.lastIndexOf(path.sep));
                let files = fs.readdirSync(folderPath);
                const firstImage = await Jimp.read(`${folderPath}/0.png`);
                const pixelRatio = (firstImage.bitmap.width / viewportWidth);
                logger.debug(`pixelRatio (firstImage.bitmap.width/viewportWidth): ${pixelRatio}, firstImage.bitmap.width: ${firstImage.bitmap.width}, viewportWidth: ${viewportWidth}`);
                if (pixelRatio !== 1) {
                    pageHeight = pageHeight * pixelRatio;
                    viewportWidth = viewportWidth * pixelRatio;
                    viewportHeight = viewportHeight * pixelRatio;
                }
                logger.info(`inside stitchImages()——pixelRatio: ${pixelRatio}, imageName: ${imageName}, pageHeight: ${pageHeight}, viewportWidth: ${viewportWidth}, viewportHeight: ${viewportHeight}, ${files.length} images.`);

                //create the new blank fullpage image
                const newImage = new Jimp(viewportWidth, pageHeight);

                //crop the last image
                const toBeCropped = (files.length * (viewportHeight)) - (pageHeight);
                if ((viewportHeight) - toBeCropped < 0) { //error handling in commands.js should prevent this from ever reaching
                    logger.warn(`imagesPath: ${imagesPath}`);
                    logger.warn(`pixelRatio: ${pixelRatio}, imageName: ${imageName}, imagesPath: ${imagesPath}, pageHeight: ${pageHeight}, viewportWidth: ${viewportWidth}, viewportHeight: ${viewportHeight}`);
                    logger.warn(`toBeCropped:${toBeCropped}, viewportHeight-toBeCropped:${viewportHeight - toBeCropped}`);
                    return "error";
                }
                logger.debug(`files.length:${files.length}, viewportHeight:${viewportHeight}, pageHeight:${pageHeight}, toBeCropped:${(files.length * viewportHeight) - pageHeight} ((files.length*viewportHeight)-pageHeight)`);
                logger.debug(`calculations of what last image should be - viewportWidth:${viewportWidth} x height:${viewportHeight - toBeCropped} (viewportHeight-toBeCropped)`);
                const bottomImagePath = `${folderPath}/${files.length - 1}.png`;
                const bottomImage = await Jimp.read(bottomImagePath);
                logger.debug(`raw last image width:${bottomImage.bitmap.width} x height:${bottomImage.bitmap.height}`);
                // bottomImage.resize(viewportWidth, Jimp.AUTO) //resize (causes issue with retina display)
                if (viewportHeight - toBeCropped !== 0) {
                    bottomImage.crop(0, 0, viewportWidth, viewportHeight - toBeCropped);
                    logger.debug(`cropped last image width:${bottomImage.bitmap.width} x height:${bottomImage.bitmap.height}`);
                    bottomImage.write(`${folderPath}/${files.length - 1}.png`); //overwrite the file
                } else {
                    logger.info(`stopped the cropping because: viewportHeight-toBeCropped = 0, removing the image at: ${bottomImagePath}`);
                    fs.unlinkSync(bottomImagePath);
                    files = fs.readdirSync(folderPath); //reading this folder again since an image has been deleted
                }

                //stitch the images all together
                for (let i = 0; i < files.length; i++) {
                    const image = await Jimp.read(`${folderPath}/${i}.png`);
                    logger.trace(`stitching ${i + 1}/${files.length}`);
                    newImage.blit(image, 0, viewportHeight * i);
                }

                // remove the old viewport images
                const deleteFolder = `${folderPath.substring(0, folderPath.lastIndexOf(path.sep))}`;
                fs.rmSync(deleteFolder, {recursive: true, force: true}); // comment this out to check viewports before stitched together
                logger.debug(`removed the folder at: ${deleteFolder}`);

                // write the new image to the users screenshot folder
                const userPath = `${deleteFolder.substring(0, deleteFolder.lastIndexOf(path.sep))}/${imageName}.png`;
                newImage.write(userPath);
                logger.debug(`new stitched image has been written at: ${userPath}`);
                return {
                    height: newImage.bitmap.height,
                    width: newImage.bitmap.width,
                    path: userPath
                };
            },
            async logger({type, message}) { //this task is for printing logs to node console from the custom command
                type === 'fatal' ? logger.fatal(message) :
                    type === 'error' ? logger.error(message) :
                        type === 'warn' ? logger.warn(message) :
                            type === 'info' ? logger.info(message) :
                                type === 'debug' ? logger.debug(message) :
                                    type === 'trace' ? logger.trace(message) :
                                        logger.warn('error with the logger task');
                return null;
            },
            async log({message}) {
                console.log(message);
                return null;
            },
            async getOsVersion() {
                return os.release();
            },
            getToolkit() {
                return domToolKit;
            }
        },
        'after:run':
            async () => {
                if (configFile.fail === false) {
                    try {
                        const imageResponse = await axios.get(`${configFile.url}/api/v1/projects/${configFile.projectId}/testruns/${configFile.testRunId}/images`);

                        const imageCount = imageResponse.data.page.totalItems;

                        // TODO Errors can be caught here when this equals 0...

                        function sleep(ms) {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        }

                        // just a delay, for issue with logging not removing the last log properly (race-condition with logs)
                        if (['info', 'debug', 'trace'].includes(logger.level)) await sleep(1000);

                        process.stdout.write(`View your ${imageCount} ${(imageCount === 1 ? 'capture' : 'captures')} here: `);
                        console.log(chalk.blue(`${configFile.websiteUrl}/projects/${configFile.projectId}/testruns/${configFile.testRunId}/comparisons`));


                        let comparisonResponse;
                        let comparisonTotal = 0;
                        for (let i = 0; comparisonTotal !== imageCount && i < 40; i++) { //wait 10 seconds before timeout
                            if (i > 0) {//don't wait the first iteration
                                await sleep(250);
                                process.stdout.write("\r\x1b[K"); //remove last log
                            }
                            const state = i % 5 === 0 ? "" : i % 5 === 1 ? "." : i % 5 === 2 ? ".." : i % 5 === 3 ? "..." : "....";
                            process.stdout.write(chalk.magenta(`\tloading the VisualTest comparison data${state}`));
                            comparisonResponse = await axios.get(`${configFile.url}/api/v1/projects/${configFile.projectId}/testruns/${configFile.testRunId}?expand=comparison-totals`);
                            comparisonTotal = comparisonResponse.data.comparisons.complete;
                        }
                        process.stdout.write("\r\x1b[K"); //remove last log
                        let comparisonResult = comparisonResponse.data.comparisons;

                        if (comparisonResult.status.new_image) console.log(chalk.yellow(`\t${comparisonResult.status.new_image} new base ${comparisonResult.status.new_image === 1 ? 'image' : 'images'}`));
                        if (comparisonResult.status.unreviewed) console.log(chalk.red(`\t${comparisonResult.status.unreviewed} image comparison ${comparisonResult.status.unreviewed === 1 ? 'failure' : 'failures'} to review`));
                        if (comparisonResult.status.passed) console.log(chalk.green(`\t${comparisonResult.status.passed} image ${comparisonResult.status.passed === 1 ? 'comparison' : 'comparisons'} passed`));
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
        const setupNodeEvents = async function (...args) {
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
        } else if (pluginModule.exports.default.e2e) {
            logger.info(`in pluginModule.exports.default.e2e, due to cypress.config having 'export default defineConfig' - most likely TS `);
            pluginModule.exports.default.e2e.setupNodeEvents = setupNodeEvents;
        }
    };
}

module.exports = makePluginExport({});
