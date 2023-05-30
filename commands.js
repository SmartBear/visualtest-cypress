const package_json = require("./package.json");

const func = {
    onAfterScreenshot($el, props) {
        picProps = props;
        picElements = $el;
    }
};

const headers = {
    "Authorization": null,
    "sbvt-client": "sdk",
    "sbvt-sdk": "cypress",
    "sbvt-sdk-version": package_json.version
};

let picProps, blobData, userAgentData, picElements, imageName, vtConfFile, dom, toolkitScripts, deviceInfoResponse,
    fullpageData, saveDOM, imageType, runFreezePage, platformVersion, freezePageResult, apiRes, layoutData;

Cypress.Commands.add('sbvtCapture', {prevSubject: 'optional'}, (element, name, options) => {
    imageType = "fullPage"; //default to fullpage each time a user runs sbvtCapture
    apiRes = {};
    if (!platformVersion) cy.task('getOsVersion').then((version) => platformVersion = version);
    if (!toolkitScripts) cy.task('getToolkit').then((scripts) => toolkitScripts = scripts);
    imageName = (name) ? name : (function () {
        throw new Error("sbvtCapture name cannot be null, please try sbvtCapture('Example name')");
    })(); //check for file name and then assign to global let
    imageType = (options && options.capture) ? options.capture : imageType;  //pass through options.capture if provided

    if (options && options.onAfterScreenshot || options && options.onBeforeScreenshot) {
        cy.task('logger', {type: 'warn', message: `'${imageName}': Callback functions are not supported.`});
    }

    const modifiedOptions = options ? Object.assign(options, func) : func;

    cy.task('logger', {type: 'trace', message: `Beginning sbvtCapture('${name}')`});
    if (element) cy.task('logger', {type: 'trace', message: 'This is chained and there is an "element" value'});
    cy.window()
        .then(win => {
            userAgentData = win.eval(toolkitScripts.userAgent);
            const envFromCypress = {
                testRunName: Cypress.env('TEST_RUN_NAME'),
                projectToken: Cypress.env('PROJECT_TOKEN')
            };
            return cy.task('postTestRunId', {userAgentData, envFromCypress}).then((taskData) => {
                vtConfFile = taskData; //grab visualTest.config.js data
                headers.Authorization = `Bearer ${vtConfFile.projectToken}`;
                cy.request({
                    method: "POST",
                    headers,
                    url: `${vtConfFile.url}/api/v1/device-info`,
                    failOnStatusCode: false,
                    body: {
                        "userAgentInfo": userAgentData,
                        'driverCapabilities': {
                            platformVersion
                        }
                    }
                }).then((res) => {
                    deviceInfoResponse = res.body;
                });
                takeScreenshot(element, name, modifiedOptions, win);
            }).then(() => {
                return apiRes;
            });
        });
});
let takeScreenshot = (element, name, modifiedOptions, win) => {
    let initialPageState;
    if (!vtConfFile.fail) {
        if (modifiedOptions.comparisonMode) getComparisonMode(modifiedOptions.comparisonMode, modifiedOptions.sensitivity);

        // This is to let the fullpage load fully... https://smartbear.atlassian.net/jira/software/c/projects/SBVT/boards/815?modal=detail&selectedIssue=SBVT-1088
        modifiedOptions.lazyload ? modifiedOptions.lazyload = Number(modifiedOptions.lazyload) : null; // In case the user passes their number in as a 'string'
        if (typeof modifiedOptions.lazyload === 'number' && modifiedOptions.lazyload <= 10000 && modifiedOptions.lazyload >= 0) {
            const defaultDelay = 1500; // if the user lazyloads above 375ms it will be X * 4
            const pageLoadDelay = modifiedOptions.lazyload * 4 > defaultDelay ? modifiedOptions.lazyload * 4 : defaultDelay;
            cy.task('logger', {type: 'info', message: `Adding a delay to let the page load of ${pageLoadDelay / 1000} seconds`});
            cy.wait(pageLoadDelay);
        }

        // Hide the scroll bar before the sbvtCapture starts & grab the initial state of the webpage to return it back after the capture
        initialPageState = win.eval(`inBrowserInitialPageState = {"scrollX": window.scrollX,"scrollY": window.scrollY,"overflow": document.body.style.overflow,"transform": document.body.style.transform}`);
        win.eval(`document.body.style.transform="translateY(0)"`);
        win.eval(`document.body.style.overflow="hidden"`);

        win.eval(`delete window.sbvt`); //clear the window.sbvt so subsequent runs don't have previous ignoredElements
        if (Array.isArray(modifiedOptions.ignoreElements)) { // ignoreElements function
            cy.task('logger', {type: 'info', message: `JSON.stringify(modifiedOptions.ignoreElements): ${JSON.stringify(modifiedOptions.ignoreElements)}`});

            // Make sure each element is found on the dom, will throw error here if element not found
            modifiedOptions.ignoreElements.forEach(element => {
                cy.get(element);
            });

            // Put the ignoredElements that the user gave us on the browsers window for the domCapture script to read them
            win.eval(`window.sbvt = { ignoreElements: ${JSON.stringify(modifiedOptions.ignoreElements)} }`);
        }
        modifiedOptions.saveDOM === true ? saveDOM = name : saveDOM = false;
        modifiedOptions.freezePage !== false ? runFreezePage = true : runFreezePage = false;
        if (!modifiedOptions.lazyload && runFreezePage) {
            cy.task('logger', {type: 'debug', message: `running freezePage at the beginning.`});
            freezePageResult = win.eval(toolkitScripts.freezePage);
        }
    }

    if (vtConfFile.fail) {
        console.log('The sbvtScreenshot() has failed');
        cy.task('logger', {type: 'trace', message: `sbvtCapture() has failed`}); //I dont think this should be printed out each screenshot

    } else if (element) {
        // Begin Cypress element capture method
        cy.task('logger', {type: 'debug', message: `Beginning element cy.screenshot('${name}')`});
        cy.get(element).screenshot(
            name,
            modifiedOptions,
            imageType = 'element'
        ).then(() => {
            captureDom(win);
            readImageAndBase64ToBlob();
        });

    } else if (modifiedOptions.capture === 'viewport') {
        // Begin Cypress viewport capture method
        cy.task('logger', {type: 'debug', message: `Beginning viewport cy.screenshot('${name}')`});
        cy.screenshot(
            name,
            modifiedOptions,
        ).then(() => {
            captureDom(win);
            readImageAndBase64ToBlob();
        });
    } else {
        // Begin fullpage capture method
        cy.task('logger', {type: 'debug', message: `Beginning fullpage cy.screenshot('${name}')`});
        // Load this for state issues
        fullpageData = {delay: modifiedOptions.lazyload};

        // Run some JS commands on the user's browser
        let numScrolls = win.eval("Math.ceil(Math.max(window.document.body.offsetHeight, window.document.body.scrollHeight, window.document.documentElement.offsetHeight, window.document.documentElement.scrollHeight) / window.innerHeight)");
        let offsetHeight = win.eval("Math.max(window.document.body.offsetHeight,window.document.body.scrollHeight, window.document.documentElement.offsetHeight, window.document.documentElement.scrollHeight)");
        let viewportHeight = win.eval("window.innerHeight");
        let viewportWidth = win.eval("window.innerWidth");

        if (numScrolls * viewportHeight < offsetHeight || numScrolls * viewportHeight - viewportHeight > offsetHeight) {
            // This checks if the users website is fully loaded or if there are issues with some of the numbers that will return an issue when we go to stitch or crop the images together
            //TODO eventually add a wait here and rerun the above data on the webpage
            cy.task('logger', {type: 'info', message: `numScrolls * viewportHeight <= offsetHeight: ${numScrolls * viewportHeight} >= ${offsetHeight} ——> ${numScrolls * viewportHeight >= offsetHeight}`});
            cy.task('logger', {
                type: 'info',
                message: `numScrolls * viewportHeight - viewportHeight >= offsetHeight: ${numScrolls * viewportHeight - viewportHeight} <= ${offsetHeight} ——> ${numScrolls * viewportHeight - viewportHeight <= offsetHeight}`
            });
            cy.task('logger', {
                type: 'error',
                message: `This webpage is not fully loaded, no image taken for: "${imageName}", please raise the lazyload time and try again (recommend "lazyload: 1000" to start, then lower slowly)`
            });
            return; //do not proceed the lazyload function with bad numbers here
        }
        cy.task('logger', {type: 'info', message: `numScrolls: ${numScrolls}, viewportHeight: ${viewportHeight}, offsetHeight(page height): ${offsetHeight}`});

        // Generate the array needed for a for-loop in Cypress
        let scrollArray = Array.from({length: numScrolls}, (v, k) => k + 1);

        if (numScrolls <= 1) {
            // Check if the webpage is not scrollable
            if (modifiedOptions.lazyload) {
                // Warn if the webpage is not scrollable, and user is trying to lazyload
                cy.task('logger', {type: `warn`, message: `the webpage is not scrollable, not able to lazyload "${imageName}", taking regular screenshot`});
            } else {
                // No need to throw warning if not lazyload
                cy.task('logger', {type: `info`, message: `the webpage is not scrollable for image: "${imageName}", taking regular screenshot`});
            }
        } else if (modifiedOptions.scrollMethod === "JS_SCROLL") {
            // If the user wants to use the old JS_SCROLL method
            cy.task('logger', {type: 'info', message: `Passed in 'scrollMethod= "JS_SCROLL"' taking regular screenshot`});
        } else {
            // No errors so far
            if ((modifiedOptions.lazyload !== undefined) && (modifiedOptions.lazyload > 10000 || modifiedOptions.lazyload < 0 || isNaN(modifiedOptions.lazyload))) {
                // User gave us a bad wait time
                cy.task('logger', {type: 'warn', message: `invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds`});
                throw new Error("invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds");
            } else if (typeof modifiedOptions.lazyload === 'number') { // make sure lazyload is not given
                // Begin the lazyload method - no errors
                cy.task('logger', {type: 'debug', message: `starting lazy load script with wait time: ${modifiedOptions.lazyload / 1000} seconds per scroll`});
                cy.wrap(scrollArray).each(index => {
                    cy.task('logger', {type: 'trace', message: `scrolling ${index}/${numScrolls}, waiting: ${modifiedOptions.lazyload / 1000} seconds per scroll`});
                    cy.scrollTo(0, viewportHeight * index);
                    cy.wait(modifiedOptions.lazyload);
                });
                cy.scrollTo(0, 0);
                cy.wait(1000);
                if (runFreezePage) {
                    cy.task('logger', {type: 'debug', message: `running freezePage in the lazyload function.`});
                    freezePageResult = win.eval(toolkitScripts.freezePage);
                }
            }

            // scroll down one viewport at a time and take a viewport screenshot
            cy.wrap(scrollArray).each(index => {
                cy.task('logger', {type: 'trace', message: `capturing ${index}/${numScrolls} viewport for the fullpage capture`});
                cy.screenshot(`tmp/${imageName}/${index - 1}`, {
                    capture: "viewport",
                    overwrite: true,
                    onAfterScreenshot($el, props) {
                        fullpageData = {
                            tmpPath: props.path,
                            url: $el[0].baseURI
                        };
                    }
                }).then(() => {
                    win.eval(`document.body.style.transform="translateY(${(index) * -100}vh)"`);

                    if (numScrolls === index) {
                        // This if checks if the for-loop is done...
                        cy.task('logger', {type: 'debug', message: `finished taking viewports, now going to the stitchImages task`});

                        // Jump into stitchImages task/method to stitch all the viewports together
                        cy.task('stitchImages', {
                            imageName,
                            imagesPath: fullpageData.tmpPath,
                            pageHeight: offsetHeight,
                            viewportWidth,
                            viewportHeight
                        })
                            .then((imageData) => {
                                if (imageData === "error") { //should not get here, error should be handled earlier
                                    cy.task('logger', {type: 'error', message: `Error with lazyload on ${imageName}, no screenshot taken`});
                                    return;
                                }
                                picProps = {
                                    path: imageData.path,
                                    dimensions: {
                                        height: imageData.height,
                                        width: imageData.width
                                    }
                                };
                                // Translate to the top of the page and then capture the dom
                                win.eval(`document.body.style.transform="translateY(0)"`);
                                captureDom(win);

                                // Read the new image base64 to blob to be sent to AWS
                                readImageAndBase64ToBlob();

                                // Reset browser to initial state
                                win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`);
                                win.eval(`document.body.style.transform='${initialPageState.transform}'`);
                                cy.task('logger', {type: 'trace', message: `After lazyloaded fullpage cy.screenshot('${name}')`});
                            });
                    }
                });
            });
            return;
        }
        cy.task('logger', {type: 'info', message: `starting cypress's default fullpage screenshot`});
        if (runFreezePage) {
            // freezePageResult = win.eval(toolkitScripts.freezePage)
            win.eval(toolkitScripts.freezePage); // don't overwrite for now. in freeze page test #1 it defaults to here because it is a single page webpage, maybe allow the other method to take single page screenshots
            cy.task('logger', {type: 'debug', message: `running freezePage in the default fullpage.`});
        }
        cy.screenshot(
            name,
            modifiedOptions,
        ).then(() => {
            // Translate to the top of the page and then capture the dom
            win.eval(`document.body.style.transform="translateY(0)"`);
            captureDom(win);

            // Read the new image base64 to blob to be sent to AWS
            readImageAndBase64ToBlob();

            // Reset browser to initial state
            win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`);
            win.eval(`document.body.style.transform='${initialPageState.transform}'`);
            cy.task('logger', {type: 'trace', message: `After lazyloaded fullpage cy.screenshot('${name}')`});
        });
    }
    if (!vtConfFile.fail) {
        // Return the scroll bar after the sbvtCapture has completed
        win.eval(`document.body.style.overflow='${initialPageState.overflow}'`);
        cy.task('logger', {type: 'info', message: `After sbvtCapture cy.screenshot('${name}')`});
    }
};
let sendImageApiJSON = () => {
    let imagePostData = {
        imageHeight: picProps.dimensions.height,
        imageWidth: picProps.dimensions.width,
        viewportHeight: dom.viewport.height,
        viewportWidth: dom.viewport.width,
        sessionId: vtConfFile.sessionId,
        imageType: imageType.toLowerCase(),
        imageName,
        devicePixelRatio: picProps.pixelRatio,
        imageExt: "png",
        testUrl: picElements ? picElements[0].baseURI : fullpageData.url,
        dom: JSON.stringify(dom),
        ignoredElements: JSON.stringify(dom.ignoredElementsData),
        userAgentInfo: JSON.stringify(userAgentData),
        comparisonMode: layoutData && layoutData.layoutMode ? layoutData.layoutMode : null,
        sensitivity: layoutData && layoutData.sensitivity ? layoutData.sensitivity : null,
        headless: Cypress.browser.isHeadless

    };
    Object.assign(imagePostData, deviceInfoResponse);
    // Overwrite because Cypress is more reliable
    imagePostData.browserVersion = Cypress.browser.majorVersion;

    apiRes.screenshotResult = {
        imagePath: picProps.path,
        imageSize: {
            width: imagePostData.imageWidth,
            height: imagePostData.imageHeight
        },
        devicePixelRatio: imagePostData.devicePixelRatio,
        freezePageResult
    };
    cy.request({
        method: "POST",
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images`,
        headers,
        failOnStatusCode: false,
        body: imagePostData,
    }).then((res) => {
        apiRes.imageApiResult = res.body;
        if (res.status === 201) { //if there was a imageUrl returned we then PUT the blob to it
            uploadToS3(res);
        } else { //if the create image POST fails we don't want to fail the users whole spec, we just return an error (on the interactive console and to users node console)
            console.log(`Error ${res.body.status}: ${res.body.message}`);
            cy.task('logger', {type: 'error', message: `'${imageName}': Error ${res.body.status} - ${res.body.message}`});
        }
    });
};
let uploadToS3 = async (res) => {

    /**
     in CyV7.4.0 and below you cannot send blobs on cy.request, so leaving for now
     if (vtConfFile.cypressVersion.split('.')[0] < 7 || (vtConfFile.cypressVersion.split('.')[0] <= 7 && vtConfFile.cypressVersion.split('.')[1] < 4)) {
        // Cypress version LESS THAN 7.4.0
        cy.task('logger', {type: 'trace', message: `Starting the axios S3 PUT now`});
        const axios = require("axios");
        try {
            axios.put(res.body.uploadUrl, blobData, { //this put does not need to await
                headers: {"Content-Type": "application/octet-stream"}
            })
            getImageById();
        } catch (err) {
            cy.task('logger', {type: 'error', message: `${err.message}`});
            console.log(err);
        }
    } else {
     **/

    // Cypress version greater than or equal: 7.4.0
    cy.task('logger', {type: 'trace', message: `Starting the cy.request S3 PUT now`});
    cy.request({
        method: "PUT",
        url: res.body.uploadUrl,
        headers: {"Content-Type": "application/octet-stream"},
        failOnStatusCode: false,
        body: blobData
    }).then((res) => {
        if (res.statusText === "OK") {
            cy.task('logger', {type: 'trace', message: `Successful image PUT: ${res.statusText}`});
        } else {
            cy.task('logger', {type: 'error', message: `Failed image PUT — code: ${res.status} statusText: ${res.statusText}`});
        }
        getImageById(); //only necessary for ~debugging, and only works in interactive mode
    });
};
let readImageAndBase64ToBlob = () => {
    cy.readFile(picProps.path, "base64").then((file) => {
        blobData = Cypress.Blob.base64StringToBlob(file, 'image/png');
        sendImageApiJSON();
    });
};
let captureDom = (win) => {
    dom = JSON.parse(win.eval(toolkitScripts.domCapture));
    if (Array.isArray(dom.ignoredElementsData) && dom.ignoredElementsData.length) {
        cy.task('logger', {type: "info", message: `returned dom.ignoredElementsData: ${JSON.stringify(dom.ignoredElementsData)}`});
    }

    const megabytes = ((new TextEncoder().encode(JSON.stringify(dom)).byteLength) / 1048576);
    cy.task('logger', {type: "info", message: `${imageName} dom size: ${megabytes.toFixed(4)} MB`});

    // Return and write the dom if the "saveDOM: true" flag is thrown
    if (saveDOM) {
        apiRes.dom = dom;
        cy.task('logger', {type: 'info', message: `dom has been saved to: "./cypress/dom/${saveDOM}.json"`});
        cy.writeFile(`./cypress/dom/${saveDOM}.json`, dom);
    }
};
let getImageById = () => {
    cy.request({
        method: 'GET',
        headers,
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images`
    })
        .then((res) => {
            let responseObj = {};
            responseObj.testRunId = vtConfFile.testRunId, responseObj.imageId = res.body.items[0].imageId, responseObj.imageUrl = res.body.items[0].imageUrl;// ,responseObj.imageName = response.body.items[0].imageName
            console.log('Successfully uploaded:', res.body.items[0].imageName, responseObj);
            cy.task('logger', {type: 'info', message: `Finished upload for '${res.body.items[0].imageName}', the imageId is: ${res.body.items[0].imageId}`});
        });
};
let getComparisonMode = (layoutMode, sensitivity) => {
    layoutData = {};
    if (layoutMode === 'detailed') {
        layoutData.layoutMode = 'detailed';
    } else if (layoutMode === 'layout') {
        layoutData.layoutMode = layoutMode;
        if (['low', 'medium', 'high'].includes(sensitivity)) {
            // Map sensitivity value to the proper enum value
            switch (sensitivity) {
                case "low":
                    layoutData.sensitivity = 0;
                    break;
                case "medium":
                    layoutData.sensitivity = 1;
                    break;
                case "high":
                    layoutData.sensitivity = 2;
                    break;
            }
        } else {
            throw new Error(`Since comparisonMode: "layout" on sbvtCapture: "${imageName}", sensitivity must be "low", "medium", or "high"`);
        }
    }
};

Cypress.Commands.add('sbvtPrintReport', options => {
    cy.task('printReportTask');
});