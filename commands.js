
const func = {
    onAfterScreenshot($el, props) {
        picProps = props;
        picElements = $el;
    }
};

let imageType = 'fullPage';
let apiRes = {};
let picProps;
let blobData;
let userAgentData;
let picElements;
let imageName;
let vtConfFile;
let dom;
let toolkitScripts;
let deviceInfoResponse;
let lazyloadData;
let saveDOM;

Cypress.Commands.add('sbvtCapture', { prevSubject: 'optional' }, (element, name, options) => {
    if (!toolkitScripts) cy.task('getToolkit').then((scripts) => toolkitScripts = scripts);
    imageName = (name) ? name : (function(){throw new Error("sbvtCapture name cannot be null, please try sbvtCapture('Example name')")})(); //check for file name and then assign to global let
    imageType = (options && options.capture) ? options.capture : imageType;  //pass through options.capture if provided

    if (options && options.onAfterScreenshot || options && options.onBeforeScreenshot) cy.task('logger', {type: 'warn', message: `'${imageName}': Callback functions are not supported.`});

    const modifiedOptions = options ? Object.assign(options, func) : func

    cy.task('logger', {type: 'trace', message: `Beginning sbvtCapture('${name}')`});
    if (element) cy.task('logger', {type: 'trace', message: 'This is chained and there is an "element" value'});
    cy.window()
        .then((win) => {
            userAgentData = win.eval(toolkitScripts.userAgent)
            return cy.task('postTestRunId', userAgentData).then((taskData) => {
                vtConfFile = taskData; //grab visualTest.config.js data
                cy.request({
                method: "POST",
                    url: `${vtConfFile.url}/api/v1/device-info`,
                    failOnStatusCode: false,
                    body: {
                    "userAgentInfo": userAgentData,
                        'driverCapabilities': {}
                }}).then((res) => {
                deviceInfoResponse = res.body
            })
                takeScreenshot(element, name, modifiedOptions);
            }).then(() => {
                return apiRes;
            });
        });
});
let takeScreenshot = (element, name, modifiedOptions) => {
    let initialPageState;
    if (!vtConfFile.fail) {
        // this is to let the fullpage load fully... https://smartbear.atlassian.net/jira/software/c/projects/SBVT/boards/815?modal=detail&selectedIssue=SBVT-1088
        modifiedOptions.lazyload ? modifiedOptions.lazyload = Number(modifiedOptions.lazyload) : null
        if (typeof modifiedOptions.lazyload === 'number' && modifiedOptions.lazyload <= 10000 && modifiedOptions.lazyload >= 0) {
            const defaultDelay = 1500 // if the user lazyloads above 375ms it will be X * 4
            const pageLoadDelay = modifiedOptions.lazyload * 4 > defaultDelay ? modifiedOptions.lazyload * 4 : defaultDelay
            cy.task('logger', {type: 'info', message: `Adding a delay to let the page load of ${pageLoadDelay/1000} seconds`})
            cy.wait(pageLoadDelay)
        }

        //hide the scroll bar before the sbvtCapture starts & grab the initial state of the webpage to return it back after the capture
        cy.window()
            .then((win) => {
                initialPageState = win.eval(`inBrowserInitialPageState = {"scrollX": window.scrollX,"scrollY": window.scrollY,"overflow": document.body.style.overflow,"transform": document.body.style.transform}`)
                win.eval(`document.body.style.transform="translateY(0)"`)
                win.eval(`document.body.style.overflow="hidden"`)
            })

        //check for any elements that the user passed that they want to ignore
        if (Array.isArray(modifiedOptions.ignoreElements)) {
            cy.task('logger', {type: 'info',message: `JSON.stringify(modifiedOptions.ignoreElements): ${JSON.stringify(modifiedOptions.ignoreElements)}`});

            //make sure each element is found on the dom, will throw error here if element not found
            modifiedOptions.ignoreElements.forEach(element => {
                cy.get(element)
            })

            cy.window()
                .then((win) => {
                    win.eval(`window.sbvt = { ignoreElements: ${JSON.stringify(modifiedOptions.ignoreElements)} }`)
                })
        }
        modifiedOptions.saveDOM === true ? saveDOM = name : saveDOM = false
    }

    if (vtConfFile.fail) {
        console.log('The sbvtScreenshot() has failed');
        cy.task('logger', {type: 'trace', message: `sbvtCapture() has failed`}); //I dont think this should be printed out each screenshot
    } else if (element) {
        cy.task('logger', {type: 'debug', message: `Before element cy.screenshot('${name}')`});
        cy.get(element).screenshot(
            name,
            modifiedOptions,
            imageType = 'element'
        ).then(() => {
            domCapture();
            picFileFormat();
        });
    } else if (modifiedOptions.capture === 'viewport') {
        cy.task('logger', {type: 'debug', message: `Before viewport cy.screenshot('${name}')`});
        cy.screenshot(
            name,
            modifiedOptions,
        ).then(() => {
            domCapture();
            picFileFormat();
        });
    } else {
        cy.task('logger', {type: 'debug', message: `Before fullpage cy.screenshot('${name}')`})

        cy.window()
            .then((win) => {
                if (typeof modifiedOptions.lazyload === 'number') {
                    lazyloadData = {delay: modifiedOptions.lazyload}
                    let numScrolls = win.eval("Math.ceil(Math.max(window.document.body.offsetHeight, window.document.body.scrollHeight, window.document.documentElement.offsetHeight, window.document.documentElement.scrollHeight) / window.innerHeight)")
                    let offsetHeight = win.eval("window.document.body.offsetHeight");
                    let viewportHeight = win.eval("window.innerHeight");
                    let viewportWidth = win.eval("window.innerWidth");
                    if (numScrolls * viewportHeight < offsetHeight || numScrolls * viewportHeight - viewportHeight > offsetHeight) {
                        //TODO eventually add a wait here and rerun the above data on the webpage
                        cy.task('logger', {type: 'info', message: `numScrolls * viewportHeight <= offsetHeight: ${numScrolls * viewportHeight} >= ${offsetHeight} ——> ${numScrolls * viewportHeight >= offsetHeight}`})
                        cy.task('logger', {type: 'info', message: `numScrolls * viewportHeight - viewportHeight >= offsetHeight: ${numScrolls * viewportHeight - viewportHeight} <= ${offsetHeight} ——> ${numScrolls * viewportHeight - viewportHeight <= offsetHeight}`})
                        cy.task('logger', {type: 'error', message: `This webpage is not fully loaded, no image taken for: "${imageName}", please raise the lazyload time and try again (recommend "lazyload: 1000" to start, then lower slowly)`})
                        return //do not proceed the lazyload function with bad numbers here
                    }
                    cy.task('logger', {type: 'info', message: `numScrolls: ${numScrolls}, viewportHeight: ${viewportHeight}, offsetHeight: ${offsetHeight}`})
                    let scrollArray = Array.from({length:numScrolls},(v,k)=>k+1)
                    if (modifiedOptions.lazyload <= 10000 && modifiedOptions.lazyload >= 0 && numScrolls > 1) { //within ms params & a scrollable page
                        cy.task('logger', {type: 'debug', message: `starting lazy load script with wait time: ${modifiedOptions.lazyload/1000} seconds per scroll`})

                        cy.wrap(scrollArray).each(index => {
                            cy.task('logger', {type: 'trace', message: `scrolling ${index}/${numScrolls}, waiting: ${modifiedOptions.lazyload/1000} seconds per scroll`})
                            cy.scrollTo(0, viewportHeight*index);
                            cy.wait(modifiedOptions.lazyload);
                        })

                        cy.scrollTo(0, 0);
                        cy.wait(1000);

                        // scroll down a viewport at a time and take a viewport screenshot
                        cy.wrap(scrollArray).each(index => {
                            cy.task('logger', {type: 'trace', message: `capturing ${index}/${numScrolls} viewport for the fullpage capture`})
                            cy.screenshot(`toBeDeleted/${imageName}/${index-1}`,{
                                capture: "viewport",
                                overwrite: true,
                                onAfterScreenshot($el, props) {
                                    lazyloadData = {
                                        tmpPath: props.path,
                                        url: $el[0].baseURI
                                    }
                                }
                            }).then(() => {
                                win.eval(`document.body.style.transform="translateY(${(index)*-100}vh)"`)
                                if (numScrolls === index) {// because of cypress and no await... (is called at the end of the taking all the viewport images)
                                    cy.task('logger', {type: 'info', message: `finished taking viewports, now going to the lazyStitch task`})
                                    cy.task('lazyStitch', {imageName, lazyLoadedPath: lazyloadData.tmpPath, pageHeight: offsetHeight, viewportWidth, viewportHeight})
                                        .then((imageData) => {
                                            if (imageData === "error") { //should not get here, error should be handled earlier
                                                cy.task('logger', {type: 'error', message: `Error with lazyload on ${imageName}, no screenshot taken`});
                                                return
                                            }
                                            picProps = {
                                                path: imageData.path,
                                                dimensions: {
                                                    height: imageData.height,
                                                    width: imageData.width
                                                }
                                            }
                                            win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`)
                                            win.eval(`document.body.style.transform='${initialPageState.transform}'`)
                                            domCapture();
                                            picFileFormat();
                                            cy.task('logger', {type: 'trace', message: `After lazyloaded fullpage cy.screenshot('${name}')`});
                                        });
                                }
                            })
                        })
                        return
                    } else if (modifiedOptions.lazyload > 10000 || modifiedOptions.lazyload < 0){ //warning if invalid wait time
                        cy.task('logger', {type: 'warn', message: `invalid wait time value for lazyload, must be a number & between 0 - 10,000 milliseconds, taking regular screenshot`})
                    } else if (numScrolls <= 1) { //warning if page isnt scrollable
                        cy.task('logger', {type: 'warn', message: `the webpage is not scrollable, not able to lazyload "${imageName}", taking regular screenshot`})
                    } else {
                        cy.task('logger', {type: 'warn', message: `error — not able to lazyload "${imageName}", taking regular screenshot`})
                    }
                } else if (modifiedOptions.lazyload !== undefined) {
                    cy.task('logger', {type: 'warn', message: `invalid wait time value for lazyload, must be a number`})
                }
                cy.task('logger', {type: 'info', message: `starting cypress's default fullpage screenshot`})
                cy.screenshot(
                        name,
                        modifiedOptions,
                ).then(() => {
                    win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`)
                    win.eval(`document.body.style.transform='${initialPageState.transform}'`)
                    domCapture();
                    picFileFormat();
                })
            })
    }
    if (!vtConfFile.fail) {
        //return the scroll bar after the sbvtCapture has completed
        cy.window()
            .then((win) => {
                win.eval(`document.body.style.overflow='${initialPageState.overflow}'`)
            })
        cy.task('logger', {type: 'info', message: `After sbvtCapture cy.screenshot('${name}')`});
    }
};
let sendImageApiJSON = () => {
    let imagePostData = {
        imageHeight: picProps.dimensions.height,
        imageWidth: picProps.dimensions.width,
        viewportHeight: picElements ? picElements[0].clientHeight : dom.viewport.height,
        viewportWidth: picElements ? picElements[0].clientWidth : dom.viewport.width,
        sessionId: vtConfFile.sessionId,
        imageType: imageType.toLowerCase(),
        imageName,
        devicePixelRatio: picProps.pixelRatio,
        imageExt: "png",
        testUrl: picElements ? picElements[0].baseURI : lazyloadData.url,
        dom: JSON.stringify(dom),
        ignoredElements: JSON.stringify(dom.ignoredElementsData),
        userAgentInfo: JSON.stringify(userAgentData)
    }
    Object.assign(imagePostData, deviceInfoResponse);
    cy.request({
        method: "POST",
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images`,
        headers: {"Authorization": `Bearer ${vtConfFile.projectToken}`},
        failOnStatusCode: false,
        body: imagePostData,
    }).then( (res) => {
        if (res.status === 201) { //if there was a imageUrl returned we then PUT the blob to it
            uploadToS3(res);
        } else { //if the create image POST fails we don't want to fail the users whole spec, we just return an error (on the interactive console and to users node console)
            console.log(`Error ${res.body.status}: ${res.body.message}`);
            cy.task('logger', {type: 'error', message: `'${imageName}': Error ${res.body.status} - ${res.body.message}`});
        }
    })
};
let uploadToS3 = async (res) => {
    if (vtConfFile.cypressVersion.split('.')[0] < 7 || (vtConfFile.cypressVersion.split('.')[0] <= 7 && vtConfFile.cypressVersion.split('.')[1] < 4)) {
        //cypress version LESS THAN 7.4.0
        cy.task('logger', {type: 'trace', message: `Starting the axios S3 PUT now`});
        const axios = require("axios");
        try {
            axios.put(res.body.uploadUrl, blobData, { //this put does not need to await
                headers: { "Content-Type": "application/octet-stream" }
            })
            getImageById();
        } catch (err) {
            cy.task('logger', {type: 'error', message: `${err.message}`});
            console.log(err);
        }
    } else {
        //cypress version greater than or equal: 7.4.0
        cy.task('logger', {type: 'trace', message: `Starting the cy.request S3 PUT now`});
        cy.request({
            method: "PUT",
            url: res.body.uploadUrl,
            headers: {"Content-Type": "application/octet-stream"},
            failOnStatusCode: false,
            body: blobData
        }).then((res) => {
            if (res.statusText === "OK" ) {
                cy.task('logger', {type: 'trace', message: `Successful image PUT: ${res.statusText}`});
            } else {
                cy.task('logger', {type: 'error', message: `Failed image PUT — code: ${res.status} statusText: ${res.statusText}`});
            }
            getImageById(); //only necessary for ~debugging, and only works in interactive mode
        })
    }
}
let picFileFormat = () => {
    cy.readFile(picProps.path,"base64").then((file) => {
        blobData = Cypress.Blob.base64StringToBlob(file, 'image/png');
        sendImageApiJSON();
    });
};
let domCapture = () => {
    cy.window()
        .then((win) => {
            dom = JSON.parse(win.eval(toolkitScripts.domCapture))
            if (Array.isArray(dom.ignoredElementsData) && dom.ignoredElementsData.length) cy.task('logger', {type: "info", message: `returned dom.ignoredElementsData: ${JSON.stringify(dom.ignoredElementsData)}`});

            //return and write the dom if the "saveDOM: true" flag is thrown
            if (saveDOM) {
                cy.task('logger', {type: 'info', message: `dom has been saved to: "./cypress/dom/${saveDOM}.json"`});
                cy.writeFile(`./cypress/dom/${saveDOM}.json`, dom)
            }
        })

};
let getImageById = () => {
    cy.request({
        method: 'GET',
        headers: {"Authorization": `Bearer ${vtConfFile.projectToken}`},
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images`
    })
        .then((res) => {
            let responseObj = {};
            responseObj.testRunId = vtConfFile.testRunId,  responseObj.imageId = res.body.items[0].imageId, responseObj.imageUrl = res.body.items[0].imageUrl;// ,responseObj.imageName = response.body.items[0].imageName
            console.log('Successfully uploaded:',res.body.items[0].imageName, responseObj);
            cy.task('logger', {type: 'info', message: `Finished upload for '${res.body.items[0].imageName}', the imageId is: ${res.body.items[0].imageId}`});
        });
};