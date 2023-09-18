const axios = require('axios').default;
const {v4: uuidv4} = require('uuid');
const fs = require("fs-extra");
const package_json = require('./package.json');
const cwd = process.cwd();
const path = require("path");
const chalk = require('chalk');
require('dotenv').config();
const Jimp = require("jimp");
const os = require('os');
const pino = require('pino');
const semver = require("semver");

const targetArray = [{target: 'pino-pretty', level: 'warn'}]; //to log below warn uncomment two lines below
let logger = pino(pino.transport({targets: targetArray}));
// logger.level = 'trace' // uncomment if you want to log below 'info'

let usersCypress, env, host, webUrl, cdnUrl, debugFolderPath;
const sessionId = uuidv4();

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

let getDebugFolderPath = () => {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Add 1 to the month since it is zero-based
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    const formattedString = `${month}-${day}_${hours}-${minutes}-${seconds}`;
    return `sbvt_debug/${formattedString}_${sessionId}`;
};

let configFile = (() => {
    try {
        let config = {};
        const fileName = 'visualTest.config.js';
        const fullPath = `${process.cwd()}/${fileName}`;
        if (fs.existsSync(fullPath)) {
            logger.trace(fileName + ' has been found');
            config = {...require(fullPath)}; //write the VT config file into config object

            if (config.debug) {
                debugFolderPath = getDebugFolderPath();
                config.debug = debugFolderPath; //overwrite 'true' to the folder path for passing to commands.js
                fs.mkdirSync(debugFolderPath, {recursive: true});

                targetArray.push({
                    target: './debug-pino-transport.js',
                    level: 'trace',
                    options: {destination: `${debugFolderPath}/debug.log`}
                });
                logger = pino(pino.transport({targets: targetArray}));
                logger.level = 'trace'; //required to overwrite default 'info'
                logger.info('"debug: true" found in visualtest.config.js');
            }

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
const apiRequest = async (method, url, body, headers) => {
    return await axios({
        method: method,
        url: url,
        headers: headers,
        data: body
    }).catch((err) => {
        console.log(`Full error is: %o`, err.response.data);
        logger.info(`Full error is: %o`, err.response.data);
        return err.response;
    });
};
(async () => {
    let env = configFile.projectToken.split('_')[1].toLowerCase();
    if (env) {
        host = `https://api.${env}.visualtest.io`;
    } else {
        host = "https://api.visualtest.io";
    }
    const response = await apiRequest('get', host);
    if (response.error) {
        logger.trace(response)
        throw new Error(`The VisualTest SDK is unable to communicate with our server. This is usually due to one of the following reasons:\n\
                    1) Firewall is blocking the domain: Solution is to whitelist the domain: "*.visualtest.io"\n\
                    2) Internet access requires a proxy server: Talk to your network admin\n\
                    \n\
                    Error:\n\
                    ${response.error}`);
    } else {
        logger.info(`Got initial connection response: ${response.body}`);
    }
})();
const isValidProjectToken = (async (projectToken) => {
    const response = await apiRequest('get', `${host}/api/v1/projects/${projectToken.split('/')[0]}`, null, {Authorization: `Bearer ${projectToken}`});
    if (response.data.status) {
        logger.trace(response)
        throw new Error(`Error checking projectToken: ${response.data.message}`);
    } else {
        logger.info(`ProjectToken is correct.`)
    }
    return null
})

const checkUsersVersion =(async () => {
    const userVersion = package_json.version
    const response = await apiRequest('get', 'https://registry.npmjs.org/@smartbear/visualtest-cypress')
    const {latest: latestVersion} = response.data["dist-tags"]

    if (semver.eq(userVersion, latestVersion)) {
        // console.log(chalk.blue('The user has the latest version.'));
    } else {
        console.log(chalk.yellow('Please upgrade to the latest VisualTest Cypress Plugin version.'));
        console.log(chalk.blue('npm install @smartbear/visualtest-cypress@latest'));
    }
    return null
})();
let getDomCapture = (async () => {
    try {
        const res = await apiRequest('get', `${configFile.cdnUrl}/dom-capture.min.js`);
        return res.data;
    } catch (error) {
        configFile.fail = true;
        logger.fatal(`Error with grabbing domCapture: %o`, error.message);
    }
})();

let getUserAgent = (async () => {
    try {
        const res = await apiRequest('get', `${configFile.cdnUrl}/user-agent.min.js`);
        return res.data;
    } catch (error) {
        configFile.fail = true;
        logger.fatal(`Error with grabbing userAgent: %o`, error.message);
    }
})();

let getFreezePage = (async () => {
    try {
        const res = await apiRequest('get', `${configFile.cdnUrl}/freeze-page.min.js`);
        return res.data;
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
                    try {
                        //Create file for BitBar to grab sessionId
                        fs.writeFileSync('./node_modules/@smartbear/visualtest-cypress/sessionId.txt', sessionId);
                    } catch (error) {
                        //In case of an error do not want to throw an error
                        logger.info("FOR BitBar——issue creating the sessionId file: %o", error);
                    }
                    if (fromCommands.envFromCypress.debug || process.env.DEBUG) {
                        logger.warn(`debug flag found on ${fromCommands.envFromCypress.debug ? `CLI ENV` : `process.env`}`);
                        if (debugFolderPath) {
                            logger.warn(`debug ALREADY set true, path: ${debugFolderPath}`);
                        } else {
                            debugFolderPath = getDebugFolderPath();
                            logger.info(`debug logs started: ${debugFolderPath}`);
                            configFile.debug = debugFolderPath; //overwrite 'true' to the folder path for passing to commands.js
                            fs.mkdirSync(debugFolderPath, {recursive: true});

                            targetArray.push({
                                target: './debug-pino-transport.js',
                                level: 'trace',
                                options: {destination: `${debugFolderPath}/debug.log`}
                            });
                            logger = pino(pino.transport({targets: targetArray}));
                            logger.level = 'trace'; //required to overwrite default 'info'
                        }
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
                            const message = `Please add **module.exports = { projectToken: 'PROJECT_TOKEN' }** to your visualTest.config.js file`
                            configFile.fail = message;
                            logger.fatal(message);
                            return configFile;
                        }

                        if (configFile.projectToken.includes("PROJECT_TOKEN")) { //check to make sure the user changed it from the default
                            const message = `Please insert your projectToken. If you don't have an account, start a free trial: https://try.smartbear.com/visualtest`
                            configFile.fail = message;
                            logger.fatal(message);
                            return configFile;
                        }
                    }
                    if (!configFile.projectToken.split('/')[1]) { //check to make sure user added the auth part(~second-half) of projectToken
                        const message = `Please add your full projectToken for example -> ** projectToken: 'xxxxxxxx/xxxxxxxxxxxx' **`
                        configFile.fail = message;
                        logger.fatal(message);
                        return configFile;
                    }

                    await isValidProjectToken(configFile.projectToken);

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
                    if (configFile.testRunName.length > 100) {
                        throw new Error(`The maximum size of testRunName is 100 characters. Received: ${configFile.testRunName.length} characters.`)
                    }
                    configFile.url = host;
                    configFile.websiteUrl = webUrl;

                    configFile.cypressVersion = usersCypress.version;
                    try {
                        const postResponse = await apiRequest(
                            'post',
                            `${configFile.url}/api/v1/projects/${configFile.projectId}/testruns`, {
                                testRunName: configFile.testRunName,
                                sdk: 'cypress',
                                sdkVersion: `${package_json.version}/c${usersCypress.version}`
                            });
                        configFile.testRunId = postResponse.data.testRunId;
                        logger.debug('config.testRunId: ' + configFile.testRunId);
                    } catch (error) {
                        const message = `Error with creating testRun: %o`
                        configFile.fail = message + error.message;
                        logger.fatal(message + error.message);
                        logger.trace(`Full error with creating testRun: %o`, error);
                        return configFile;
                    }
                    configFile.fail = false; //no errors in generating testRunId
                    logger.trace('—————————————————Successfully created a testRunId—————————————————');
                }
                return configFile;
            },
            async apiRequest({method, url, body, headers}) {
                const response = {};
                try {
                    const res = await apiRequest(method, url, body, headers);
                    response.data = res.data;
                    return response; // have to return the res.data or JSON issues
                } catch (err) {
                    response.error = err;
                    return response;
                }

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

                if (configFile.debug) {
                    //copy last image before cropping or deletion
                    const lastImageFileName = path.parse(path.basename(bottomImagePath)).name; //get the last image name without extension
                    await fs.copy(bottomImagePath, `${debugFolderPath}/${imageName}-fullPage/${lastImageFileName}-before-cropped-bottom.png`);
                }

                if (viewportHeight - toBeCropped !== 0) {
                    // cropping last image
                    bottomImage.crop(0, 0, viewportWidth, viewportHeight - toBeCropped);
                    logger.debug(`cropped last image width:${bottomImage.bitmap.width} x height:${bottomImage.bitmap.height}`);
                    await bottomImage.writeAsync(`${folderPath}/${files.length - 1}.png`); //overwrite the file
                } else {
                    //deleting last image
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
                if (configFile.debug) await fs.copy(folderPath, `${debugFolderPath}/${imageName}-fullPage`);
                const deleteFolder = `${folderPath.substring(0, folderPath.lastIndexOf(path.sep))}`;
                fs.rmSync(deleteFolder, {recursive: true, force: true}); // comment this out to check viewports before stitched together, can be sync
                logger.debug(`removed the folder at: ${deleteFolder}`);

                // write the new image to the users screenshot folder
                const userPath = `${deleteFolder.substring(0, deleteFolder.lastIndexOf(path.sep))}/${imageName}.png`;
                await newImage.writeAsync(userPath);
                if (configFile.debug) fs.copy(userPath, `${debugFolderPath}/${imageName}-fullPage/${imageName}.png`); //copy the final image to debug folder
                logger.debug(`new stitched image has been written at: ${userPath}`);
                return {
                    height: newImage.bitmap.height,
                    width: newImage.bitmap.width,
                    path: userPath
                };
            },
            async copy({path, imageName, imageType}) {
                if (configFile.debug) await fs.copy(path, `${debugFolderPath}/${imageName}-${imageType}/${imageName}.png`); //copy the final image to debug folder
                return null;
            },
            async logger({type, message}) { //this task is for printing logs to node console from the custom command
                //todo this still isnt waiting to print the logger before returning
                type === 'fatal' ? await logger.fatal(message) :
                    type === 'error' ? await logger.error(message) :
                        type === 'warn' ? await logger.warn(message) :
                            type === 'info' ? await logger.info(message) :
                                type === 'debug' ? await logger.debug(message) :
                                    type === 'trace' ? await logger.trace(message) :
                                        await logger.warn('error with the logger task');
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
            },
            async getTestRunResult(timeoutMinutes = 3) {
                const response = {};
                try {
                    if (!configFile.url) {
                        response.error = "Cannot run this without first taking a sbvtCapture()";
                        return response;
                    }
                    let testRunUrl = `${configFile.url}/api/v1/projects/${configFile.projectId}/testruns/${configFile.testRunId}?expand=comparison-totals`;
                    let comparisonResponse = await apiRequest('get', testRunUrl);

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    let i = 0;
                    while (comparisonResponse.data.comparisons.pending > 0 && i < (timeoutMinutes * 60) * 4) {
                        //default timeout after 3 minutes
                        comparisonResponse = await apiRequest('get', testRunUrl);
                        await sleep(250);
                        i++;
                    }
                    if (comparisonResponse.data.comparisons.pending) console.log(chalk.magenta('\tComparison results are still in pending state, get up to date results on VisualTest website.'));

                    response.data = comparisonResponse.data.comparisons;
                    return response;
                } catch (error) {
                    logger.info(error.code);
                    logger.trace(error);
                    return null;
                }
            },
            printReport(comparisonResponse) {
                try {
                    process.stdout.write(`View your ${comparisonResponse.aggregate.failed + comparisonResponse.aggregate.passed} ${(comparisonResponse.aggregate.failed + comparisonResponse.aggregate.passed === 1 ? 'capture' : 'captures')} here: `);
                    console.log(chalk.blue(`${configFile.websiteUrl}/projects/${configFile.projectId}/testruns/${configFile.testRunId}/comparisons`));

                    if (comparisonResponse.status.new_image) console.log(chalk.yellow(`\t${comparisonResponse.status.new_image} new base ${comparisonResponse.status.new_image === 1 ? 'image' : 'images'}`));
                    if (comparisonResponse.status.unreviewed) console.log(chalk.red(`\t${comparisonResponse.status.unreviewed} image comparison ${comparisonResponse.status.unreviewed === 1 ? 'failure' : 'failures'} to review`));
                    if (comparisonResponse.status.passed) console.log(chalk.green(`\t${comparisonResponse.status.passed} image ${comparisonResponse.status.passed === 1 ? 'comparison' : 'comparisons'} passed`));

                    // return comparisonResponse; // no need to return data on this call
                    return null;

                } catch (error) {
                    logger.warn(`Issue with printing report: ${error}`);
                    return null;
                }
            }
        }
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
            logger.info(`in pluginModule.exports.e2e - most likely newer version of Cypress (+10) `);
            pluginModule.exports.e2e.setupNodeEvents = setupNodeEvents;
        } else if (pluginModule.exports.default && pluginModule.exports.default.e2e) {
            logger.info(`in pluginModule.exports.default.e2e, due to cypress.config having 'export default defineConfig' - most likely TS `);
            pluginModule.exports.default.e2e.setupNodeEvents = setupNodeEvents;
        } else {
            logger.info(`in pluginModule.exports - most likely older version of Cypress (-10) `);
            pluginModule.exports = setupNodeEvents;
        }
    };
}

module.exports = makePluginExport({});