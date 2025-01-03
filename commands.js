import 'cypress-axe'

const func = {
    onAfterScreenshot($el, props) {
        picProps = props;
        picElements = $el;
    }
};

let picProps, blobData, userAgentData, picElements, imageName, vtConfFile, dom, toolkitScripts, deviceInfoResponse,
    fullpageData, imageType, platformVersion, freezePageResult, apiRes, layoutData, violationRules;
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
                testRunName: Cypress.env('TEST_RUN_NAME') || Cypress.env('test_run_name'),
                projectToken: Cypress.env('PROJECT_TOKEN') || Cypress.env('project_token'),
                debug: Cypress.env('DEBUG') || Cypress.env('debug')
            };
            return cy.task('postTestRunId', {userAgentData, envFromCypress}).then((taskData) => {
                vtConfFile = taskData; //grab visualTest.config.js data
                if (taskData.fail) {
                    throw new Error(taskData.fail);
                }
                cy.task('logger', {type: 'trace', message: `data returned from creating testRun`, taskData});
                cy.task('apiRequest', {
                    method: 'post', url: `${vtConfFile.url}/api/v1/device-info`, body: {
                        "userAgentInfo": userAgentData, 'driverCapabilities': {
                            platformVersion
                        }
                    }
                }).then((response) => {
                    if (response.data.status) {
                        cy.task('logger', {type: 'trace', message: response.data});
                        throw new Error(`Issue with apiRequest ${response.data.message}`);
                    } else {
                        deviceInfoResponse = response.data;
                    }
                });
                takeScreenshot(element, name, modifiedOptions, win);
            }).then(() => {
                return apiRes;
            });
        });
});
const takeScreenshot = (element, name, modifiedOptions, win) => {
    let initialPageState;
    if (!vtConfFile.fail) {
        if (modifiedOptions.comparisonMode) getComparisonMode(modifiedOptions.comparisonMode, modifiedOptions.sensitivity);

        // This is to let the fullpage load fully... https://smartbear.atlassian.net/jira/software/c/projects/SBVT/boards/815?modal=detail&selectedIssue=SBVT-1088
        modifiedOptions.lazyload ? modifiedOptions.lazyload = Number(modifiedOptions.lazyload) : null; // In case the user passes their number in as a 'string'
        if (typeof modifiedOptions.lazyload === 'number' && modifiedOptions.lazyload <= 10000 && modifiedOptions.lazyload >= 0) {
            const defaultDelay = 1500; // if the user lazyloads above 375ms it will be X * 4
            const pageLoadDelay = modifiedOptions.lazyload * 4 > defaultDelay ? modifiedOptions.lazyload * 4 : defaultDelay;
            cy.task('logger', {
                type: 'info', message: `Adding a delay to let the page load of ${pageLoadDelay / 1000} seconds`
            });
            cy.wait(pageLoadDelay);
        }

        // Hide the scroll bar before the sbvtCapture starts & grab the initial state of the webpage to return it back after the capture
        initialPageState = win.eval(`inBrowserInitialPageState = {"scrollX": window.scrollX,"scrollY": window.scrollY,"bodyOverflow": document.body.style.overflow,"documentOverflow": document.documentElement.style.overflow,"transform": document.body.style.transform}`);
        win.eval(`document.body.style.transform="translateY(0)"`);
        win.eval(`document.body.style.overflow="hidden"`);
        win.eval(`document.documentElement.style.overflow='hidden'`);

        win.eval(`delete window.sbvt`); //clear the window.sbvt so subsequent runs don't have previous ignoredElements
        if (Array.isArray(modifiedOptions.ignoreElements)) { // ignoreElements function
            cy.task('logger', {
                type: 'info',
                message: `JSON.stringify(modifiedOptions.ignoreElements): ${JSON.stringify(modifiedOptions.ignoreElements)}`
            });

            // Make sure each element is found on the dom, will throw error here if element not found
            modifiedOptions.ignoreElements.forEach(element => {
                cy.get(element);
            });

            // Put the ignoredElements that the user gave us on the browsers window for the domCapture script to read them
            win.eval(`window.sbvt = { ignoreElements: ${JSON.stringify(modifiedOptions.ignoreElements)} }`);
        }
        modifiedOptions.freezePage !== false ? modifiedOptions.freezePage = true : modifiedOptions.freezePage = false;
    }

    if (vtConfFile.fail) {
        console.log('The sbvtScreenshot() has failed');
        cy.task('logger', {type: 'trace', message: `sbvtCapture() has failed`}); //I dont think this should be printed out each screenshot
    } else if (element) {
        // Begin Cypress element capture method
        cy.task('logger', {type: 'debug', message: `Beginning element cy.screenshot('${name}')`});
        if (!modifiedOptions.lazyload && modifiedOptions.freezePage) freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
        cy.get(element).screenshot(name, modifiedOptions, imageType = 'element').then(() => {
            if (vtConfFile.debug) cy.task('copy', {path: picProps.path, imageName, imageType});
            captureDom(win);
            runAxeCheck()
            readImageAndBase64ToBlob();
        });

    } else if (modifiedOptions.capture === 'viewport') {
        // Begin Cypress viewport capture method
        cy.task('logger', {type: 'debug', message: `Beginning viewport cy.screenshot('${name}')`});
        if (!modifiedOptions.lazyload && modifiedOptions.freezePage) freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
        cy.screenshot(name, modifiedOptions,).then(() => {
            if (vtConfFile.debug) cy.task('copy', {path: picProps.path, imageName, imageType});
            captureDom(win);
            runAxeCheck()
            readImageAndBase64ToBlob();
        });
    } else {
        // Begin fullpage capture method
        cy.task('logger', {type: 'debug', message: `Beginning fullpage cy.screenshot('${name}')`});
        // Load this for state issues
        fullpageData = {delay: modifiedOptions.lazyload};

        let {numScrolls, offsetHeight, viewportHeight, viewportWidth} = getWebpageDimension(win);

        if (numScrolls * viewportHeight < offsetHeight || numScrolls * viewportHeight - viewportHeight > offsetHeight) {
            // This checks if the users website is fully loaded or if there are issues with some of the numbers that will return an issue when we go to stitch or crop the images together
            //TODO eventually add a wait here and rerun the above data on the webpage
            cy.task('logger', {
                type: 'info',
                message: `numScrolls * viewportHeight <= offsetHeight: ${numScrolls * viewportHeight} >= ${offsetHeight} ——> ${numScrolls * viewportHeight >= offsetHeight}`
            });
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

        // Generate the array needed for a for-loop in Cypress
        let scrollArray = Array.from({length: numScrolls}, (v, k) => k + 1);

        // This is due to an ongoing issue where Chrome Cypress viewport screenshots are not capturing the whole viewport and then when going to stitch it together it has issues, so default back to Cypress's default
        if (numScrolls !== 1 && Cypress.browser.name === 'chrome' && modifiedOptions.scrollMethod !== "JS_SCROLL") {
            let testScreenshotProps;
            cy.screenshot(name, {
                capture: 'viewport', onAfterScreenshot($el, props) {
                    testScreenshotProps = props;
                }
            },).then(() => {
                cy.task('deleteImage', {path: testScreenshotProps.path});
                if (testScreenshotProps.dimensions.height !== viewportHeight) {
                    // This is due to an ongoing issue where Chrome Cypress viewport screenshots are not capturing the whole viewport and then when going to stitch it together it has issues, so default back to Cypress's default
                    cy.task('logger', {
                        type: 'info',
                        message: `starting cypress's default full-page screenshot chrome because of the mismatch`
                    });
                    if (modifiedOptions.freezePage) freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
                    runAxeCheck()
                    takeDefaultFullpageScreenshot(win, scrollArray, numScrolls, viewportHeight, offsetHeight, viewportWidth, imageName, initialPageState, modifiedOptions);
                } else {
                    // No errors so far
                    if ((modifiedOptions.lazyload !== undefined) && (modifiedOptions.lazyload > 10000 || modifiedOptions.lazyload < 0 || isNaN(modifiedOptions.lazyload))) {
                        // User gave us a bad wait time
                        cy.task('logger', {
                            type: 'warn',
                            message: `invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds`
                        });
                        throw new Error("invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds");
                    } else if (typeof modifiedOptions.lazyload === 'number') {
                        // Begin the lazyload method - no errors
                        runLazyload(modifiedOptions.lazyload, scrollArray, numScrolls, viewportHeight);

                        ({numScrolls, offsetHeight, viewportHeight, viewportWidth} = getWebpageDimension(win)) //Recalculate this in case the webpage changed dimensions during lazy loading
                        scrollArray = Array.from({length: numScrolls}, (v, k) => k + 1);
                    } else if (modifiedOptions.freezePage) {
                        freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
                    }
                    runAxeCheck()
                    takeAllTheViewportScreenshots(win, scrollArray, numScrolls, viewportHeight, offsetHeight, viewportWidth, imageName, initialPageState, modifiedOptions);
                    return null;
                }
            });
        } else {
            if (numScrolls <= 1) {
                // Check if the webpage is not scrollable
                if (modifiedOptions.lazyload) {
                    // Warn if the webpage is not scrollable, and user is trying to lazyload
                    cy.task('logger', {
                        type: `warn`,
                        message: `the webpage is not scrollable, not able to lazyload "${imageName}", taking regular screenshot`
                    });
                } else {
                    // No need to throw warning if not lazyload
                    cy.task('logger', {
                        type: `info`,
                        message: `the webpage is not scrollable for image: "${imageName}", taking regular screenshot`
                    });
                }
            } else if (modifiedOptions.scrollMethod === "JS_SCROLL") {
                // If the user wants to use the old JS_SCROLL method
                cy.task('logger', {
                    type: 'info', message: `Passed in 'scrollMethod= "JS_SCROLL"' taking regular screenshot`
                });
            } else {
                // No errors so far
                if ((modifiedOptions.lazyload !== undefined) && (modifiedOptions.lazyload > 10000 || modifiedOptions.lazyload < 0 || isNaN(modifiedOptions.lazyload))) {
                    // User gave us a bad wait time
                    cy.task('logger', {
                        type: 'warn',
                        message: `invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds`
                    });
                    throw new Error("invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds");
                } else if (typeof modifiedOptions.lazyload === 'number') { // make sure lazyload is not given
                    runLazyload(modifiedOptions.lazyload, scrollArray, numScrolls, viewportHeight);

                    if (modifiedOptions.freezePage) {
                        freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
                    }
                    //  Recalculate this in case the webpage changed dimensions during lazy loading
                    ({numScrolls, offsetHeight, viewportHeight, viewportWidth} = getWebpageDimension(win));
                    scrollArray = Array.from({length: numScrolls}, (v, k) => k + 1);
                } else if (modifiedOptions.freezePage) {
                    freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
                }

                runAxeCheck()
                takeAllTheViewportScreenshots(win, scrollArray, numScrolls, viewportHeight, offsetHeight, viewportWidth, imageName, initialPageState, modifiedOptions);
                return;
            }
            cy.task('logger', {type: 'info', message: `starting cypress's default fullpage screenshot`});
            if (modifiedOptions.freezePage) {
                freezePageResult = runFreezePage(win, toolkitScripts.freezePage);
            }
            runAxeCheck()
            takeDefaultFullpageScreenshot(win, scrollArray, numScrolls, viewportHeight, offsetHeight, viewportWidth, imageName, initialPageState, modifiedOptions);
        }
    }
    if (!vtConfFile.fail) {
        // Return the scroll bar after the sbvtCapture has completed
        win.eval(`document.body.style.overflow='${initialPageState.bodyOverflow}'`);
        win.eval(`document.documentElement.style.overflow='${initialPageState.documentOverflow}'`);
        cy.task('logger', {type: 'info', message: `After sbvtCapture cy.screenshot('${name}')`});
    }
};
const sendImageApiJSON = () => {
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
        sdkDomUpload: true,
        ignoredElements: JSON.stringify(dom.ignoredElementsData),
        userAgentInfo: JSON.stringify(userAgentData),
        comparisonMode: layoutData && layoutData.comparisonMode ? layoutData.comparisonMode : null,
        sensitivity: layoutData && (layoutData.sensitivity || layoutData.sensitivity === 0) ? layoutData.sensitivity : null,
        headless: Cypress.browser.isHeadless,
        violations: JSON.stringify(violationRules)
    };

    Object.assign(imagePostData, deviceInfoResponse);

    imagePostData.browserVersion = Cypress.browser.majorVersion;  // Overwrite because Cypress is more reliable

    //assign to keep the dom
    apiRes.screenshotResult = {
        ...apiRes.screenshotResult,  // existing properties (includes dom)
        imagePath: picProps.path, imageSize: {
            width: imagePostData.imageWidth, height: imagePostData.imageHeight
        }, devicePixelRatio: imagePostData.devicePixelRatio, freezePageResult
    };

    cy.task('apiRequest', {
        method: 'post',
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images`,
        body: imagePostData,
    }).then((response) => {
        if (response.data.status) {
            throw new Error(`Issue with apiRequest post image — status: ${response.data.status}, message: ${response.data.message}`);
        } else {
            apiRes.imageApiResult = response.data;
            uploadDomToS3(response.data.domUploadUrl, response.data.imageId);
            uploadImageToS3(response.data.uploadUrl, response.data.imageId);
        }
    });
};
const uploadDomToS3 = async (url, imageId) => {
    cy.request({
        method: "PUT", url: url, failOnStatusCode: false, body: JSON.stringify(dom)
    }).then((response) => {
        if (response.status < 200 || response.status >= 300) {
            s3ErrorPatch(response, imageId)
        } else {
            cy.task('logger', {type: 'info', message: `DOM s3 POST response ${response.status}`});
            cy.task('apiRequest', {
                method: 'PATCH',
                url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images/${imageId}`,
                body: {
                    domCaptured: true
                },
                headers: {Authorization: `Bearer ${vtConfFile.projectToken}`},
            })
                .then((patchResponse) => {
                    cy.task('logger', {type: 'info', message: `after s3 dom upload, image PATCH response: `});
                    cy.task('logger', {type: 'info', message: patchResponse});
                })
        }
    });
};
const uploadImageToS3 = async (url, imageId) => {
    cy.task('logger', {type: 'trace', message: `Starting the cy.request image S3 PUT now`});
    cy.request({
        method: "PUT",
        url,
        headers: {"Content-Type": "application/octet-stream"},
        failOnStatusCode: false,
        body: blobData
    }).then((response) => {
        if (response.status < 200 || response.status >= 300) {
            s3ErrorPatch(response, imageId);
        } else {
            cy.task('logger', {type: 'info', message: `image S3 post was successful, response: ${response.status}`});
        }
    });
};
const s3ErrorPatch = (response, imageId) => {
    cy.task('logger', {type: 'error', message: `Failed S3 PUT status: ${response.status}`});
    cy.task('logger', {
        type: 'info',
        message: `Going to PATCH the image at url: ${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images/${imageId}`
    });
    cy.request({
        method: "PATCH",
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images/${imageId}`,
        failOnStatusCode: false,
        headers: {Authorization: `Bearer ${vtConfFile.projectToken}`},
        body: {
            errorMessage: JSON.stringify(response)
        }
    }).then((response) => {
        cy.task('logger', {type: 'info', message: `after s3 image upload -> image PATCH response: ${response.status}`});
    })
}
const readImageAndBase64ToBlob = (deleteFolderPath) => {
    cy.readFile(picProps.path, "base64").then((file) => {
        blobData = Cypress.Blob.base64StringToBlob(file, 'image/png');
        checkForChangedDimensions();
        sendImageApiJSON();
    });
    if (deleteFolderPath) cy.task('deleteTmpFolder', deleteFolderPath);
};
const checkForChangedDimensions = () => {
    if (!picProps.pixelRatio) { //calculate pixel ratio
        cy.task('logger', {
            type: "info", message: `calculated pixel ratio is: ${picProps.dimensions.width / dom.viewport.width}`
        });
        picProps.pixelRatio = picProps.dimensions.width / dom.viewport.width
    }
    if (picProps.pixelRatio && Cypress.browser.isHeadless && dom.viewport.width * picProps.pixelRatio !== picProps.dimensions.width) {
        cy.task('logger', {
            type: "info",
            message: `${dom.viewport.width * picProps.pixelRatio} !== ${picProps.dimensions.width} ----> dom.viewport.width*picProps.pixelRatio !== picProps.dimensions.width`
        });
        // cy.task('logger', {type: "fatal", message: `${dom.viewport.width}*${picProps.pixelRatio} !== ${picProps.dimensions.width} ----> dom.viewport.width*picProps.pixelRatio !== picProps.dimensions.width`});
        cy.task('logger', {type: "info", message: `It looks like you are trying to change the viewport`});
        cy.task('logger', {
            type: "info", message: `This issue with Cypress makes thee captured image look disproportional`
        });
        cy.task('logger', {type: "info", message: `Check this Cypress documentation for a solution: `});
        cy.task('logger', {
            type: "info",
            message: `\t\thttps://docs.cypress.io/api/plugins/browser-launch-api#Set-screen-size-when-running-headless`
        });
    }
};
const captureDom = (win) => {
    dom = JSON.parse(win.eval(toolkitScripts.domCapture));
    dom.screenshotType = imageType.toLowerCase();

    if (Array.isArray(dom.ignoredElementsData) && dom.ignoredElementsData.length) {
        cy.task('logger', {
            type: "info", message: `returned dom.ignoredElementsData: ${JSON.stringify(dom.ignoredElementsData)}`
        });
    }

    const megabytes = ((new TextEncoder().encode(JSON.stringify(dom)).byteLength) / 1048576);
    cy.task('logger', {type: "info", message: `${imageName} dom size: ${megabytes.toFixed(4)} MB`});

    if (vtConfFile.debug) {
        // Return and write the dom if the "debug: true" flag is thrown
        apiRes.screenshotResult = {};
        apiRes.screenshotResult.dom = dom;
        // apiRes.dom = dom;
        cy.task('logger', {type: 'info', message: `dom has been saved to: "./${vtConfFile.debug}/${imageName}.json"`});
        cy.writeFile(`./${vtConfFile.debug}/${imageName}-${imageType}/${imageName}.json`, dom);
    }
};
const ensureScrolledToTop = (win) => {
    let tries = 0;
    let scrollOffset = win.eval(`window.scrollY`);
    while (scrollOffset !== 0 && tries < 40) {
        tries++;
        cy.task('logger', {
            type: 'warn',
            message: `Page not scrolled to the top. Scroll offset is: ${scrollOffset}. Trying to scroll to the top again and waiting 250ms. Try #: ${tries}`
        });
        cy.scrollTo(0, 0);
        win.eval(`window.scrollTo(0, 0);`);
        cy.wait(250);
        scrollOffset = win.eval(`window.scrollY`); //check and update the scrolled position again
    }
    if (tries < 40 && scrollOffset === 0) {
        cy.task('logger', {type: 'info', message: `Scroll offset is: ${scrollOffset}, after ${tries} tries`});
    } else {
        cy.task('logger', {
            type: 'warn',
            message: `Couldn't scroll to the top of page after ${tries} tries. Scroll offset positon stuck at: ${scrollOffset}.`
        });
        // throw new Error(`Couldn't scroll to the top of page after ${tries} tries. Scroll offset positon stuck at: ${scrollOffset}.`);
    }
}
const getComparisonMode = (comparisonMode, sensitivity) => {
    cy.task('logger', {type: 'info', message: `comparisonMode: ${comparisonMode}, sensitivity: ${sensitivity}`});
    layoutData = {};
    if (comparisonMode === 'detailed') {
        layoutData.comparisonMode = 'detailed';
    } else if (comparisonMode === 'layout') {
        layoutData.comparisonMode = comparisonMode;
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
    } else {
        throw new Error(`on sbvtCapture: "${imageName}", comparisonMode: "${comparisonMode}" is invalid — must be either "detailed" or "layout"`);
    }
};
const getWebpageDimension = (win) => {
    // Run some JS commands on the user's browser to get details about the webpage
    let numScrolls = win.eval("Math.ceil(Math.max(window.document.body.offsetHeight, window.document.body.scrollHeight, window.document.documentElement.offsetHeight, window.document.documentElement.scrollHeight) / window.innerHeight)");
    let offsetHeight = win.eval("Math.max(window.document.body.offsetHeight,window.document.body.scrollHeight, window.document.documentElement.offsetHeight, window.document.documentElement.scrollHeight)");
    let viewportHeight = win.eval("window.innerHeight");
    let viewportWidth = win.eval("window.innerWidth");

    cy.task('logger', {
        type: 'info',
        message: `numScrolls: ${numScrolls}, viewportHeight: ${viewportHeight}, offsetHeight(page height): ${offsetHeight}`
    });

    return {numScrolls, offsetHeight, viewportHeight, viewportWidth};
}
const takeAllTheViewportScreenshots = (win, scrollArray, numScrolls, viewportHeight, offsetHeight, viewportWidth, imageName, initialPageState) => {
    cy.wrap(scrollArray).each(index => {
        cy.task('logger', {
            type: 'trace', message: `capturing ${index}/${numScrolls} viewport for the fullpage capture`
        });
        cy.screenshot(`tmp/${imageName}/${index - 1}`, {
            capture: "viewport", overwrite: true, onAfterScreenshot($el, props) {
                fullpageData = {
                    tmpPath: props.path, url: $el[0].baseURI
                };
            }
        }).then(() => {
            win.eval(`document.body.style.transform="translateY(${(index) * -100}vh)"`);
            if (numScrolls === index) {
                // This if checks if the for-loop is done...
                cy.task('logger', {
                    type: 'debug', message: `finished taking viewports, now going to the stitchImages task`
                });
                // Jump into stitchImages task/method to stitch all the viewports together
                cy.task('stitchImages', {
                    imageName, imagesPath: fullpageData.tmpPath, pageHeight: offsetHeight, viewportWidth, viewportHeight
                })
                    .then((imageData) => {
                        if (imageData === "error") { //should not get here, error should be handled earlier
                            cy.task('logger', {
                                type: 'error', message: `Error with lazyload on ${imageName}, no screenshot taken`
                            });
                            return;
                        }
                        if (viewportWidth !== imageData.width) {
                            cy.task('lowerImageResolution', {
                                image: imageData.path, viewportWidth: viewportWidth, tmpPath: fullpageData.tmpPath
                            }).then((newImageData) => {
                                imageData.path = newImageData.path
                                imageData.width = newImageData.width
                                imageData.height = newImageData.height

                                if (vtConfFile.debug) cy.task('copy', {
                                    path: imageData.path, imageName: imageName, imageType, reduced: true
                                });

                                takeTheStitchImage(imageData, win, initialPageState, newImageData.deletePath)
                            })
                        } else {
                            takeTheStitchImage(imageData, win, initialPageState)
                        }
                    });
            }
        });
    });
}
const takeTheStitchImage = (imageData, win, initialPageState, deletePath = null) => {
    picProps = {
        path: imageData.path, dimensions: {
            height: imageData.height, width: imageData.width
        }
    };
    // Reset browser to initial state
    win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`);
    win.eval(`document.body.style.transform='${initialPageState.transform}'`);
    ensureScrolledToTop(win);
    captureDom(win);
    win.eval(`document.documentElement.style.overflow='${initialPageState.documentOverflow}'`);

    // Read the new image base64 to blob to be sent to AWS
    readImageAndBase64ToBlob(deletePath);
}
const runLazyload = (waitTime, scrollArray, numScrolls, viewportHeight) => {
    cy.task('logger', {
        type: 'debug', message: `starting lazy load script with wait time: ${waitTime / 1000} seconds per scroll`
    });
    cy.wrap(scrollArray).each(index => {
        cy.task('logger', {
            type: 'trace', message: `scrolling ${index}/${numScrolls}, waiting: ${waitTime / 1000} seconds per scroll`
        });
        cy.scrollTo(0, viewportHeight * index);
        cy.wait(waitTime);
    });
    cy.scrollTo(0, 0);
    cy.wait(1000);
    return null;
}

const takeDefaultFullpageScreenshot = (win, scrollArray, numScrolls, viewportHeight, offsetHeight, viewportWidth, imageName, initialPageState, modifiedOptions) => {
    cy.screenshot(name, modifiedOptions,).then(() => {
        if (vtConfFile.debug) cy.task('copy', {path: picProps.path, imageName, imageType});

        // Reset browser to initial state
        win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`);
        win.eval(`document.body.style.transform='${initialPageState.transform}'`);
        // ensureScrolledToTop(win) //this creates issues, but this is the JS_SCROLL method
        captureDom(win);

        win.eval(`document.documentElement.style.overflow='${initialPageState.documentOverflow}'`);
        cy.task('logger', {type: 'trace', message: `After default fullpage cy.screenshot('${name}')`});

        // Read the new image base64 to blob to be sent to AWS
        cy.task('lowerImageResolution', {
            image: picProps.path, viewportWidth: viewportWidth, tmpPath: picProps.path
        }).then((newImageData) => {
            picProps.path = newImageData.path
            picProps.dimensions.width = newImageData.width
            picProps.dimensions.height = newImageData.height
            readImageAndBase64ToBlob();
        })
    });
}
const runFreezePage = (win, script) => {
    cy.task('logger', {type: 'debug', message: `running freezePage.`});
    freezePageResult = win.eval(script);
    cy.task('logger', {type: 'debug', message: `freezePageResult: ${JSON.stringify(freezePageResult)}`});
    return freezePageResult;
}
Cypress.Commands.add('sbvtGetTestRunResult', () => {
    //returns the testRun data aggregate as an object (removes other, sends only passed & failed)
    return cy.task('getTestRunResult')
        .then((response) => {
            if (response.error) {
                cy.task('logger', {
                    type: 'error', message: `There was an issue with cy.sbvtGetTestRunResult() — ${response.error}`
                });
                cy.wait(700); //without this, the logger doesn't get printed
            } else {
                delete response.data.aggregate.other;
                return response.data.aggregate;
            }
        });
});
Cypress.Commands.add('sbvtPrintReport', () => {
    cy.task('getTestRunResult')
        .then(response => {
            if (response.error) {
                cy.task('logger', {
                    type: 'error', message: `There was an issue with cy.sbvtPrintReport() — ${response.error}`
                });
                cy.wait(700); //without this, the logger doesn't get printed
            } else {
                cy.task('printReport', response.data);
                cy.wait(700); //without this, the logger doesn't get printed
            }
        });
});

export const runAxeCheck = () => {
    cy.injectAxe()
    cy.checkA11y(null, null, (violations) => {
        return checkForViolations(violations);
    }, true);

    const checkForViolations = (violations) => {
        if (violations?.length > 0) {
            violationRules = [];
            for (const violation of violations) {
                for (const node of violation.nodes) {
                    const getRectangle = ($el) => $el[0].getBoundingClientRect();
                    cy.get(node.target[0])
                        .then($el => {
                            const rect = getRectangle($el);
                            const final = {
                                description: violation.description,
                                help: violation.help,
                                helpUrl: violation.helpUrl,
                                id: violation.id,
                                impact: violation.impact,
                                boundingBox: {
                                    x: rect.x,
                                    y: rect.y,
                                    width: rect.width,
                                    height: rect.height,
                                    target: node.target[0],
                                    html: $el[0].outerHTML
                                },
                            };
                            violationRules.push(final);
                        });
                }
            }
            // cy.task('log', {message: violationRules})
            return violationRules;
        } else {
            return null;
        }
    }
}
