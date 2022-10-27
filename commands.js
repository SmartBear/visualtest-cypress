
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

Cypress.Commands.add('sbvtCapture', { prevSubject: 'optional' }, (element, name, options) => {
    if (!toolkitScripts) cy.task('loadScripts').then((scripts) => toolkitScripts = scripts) //load the scripts from the toolkit
    imageName = (name) ? name : (function(){throw new Error("sbvtCapture name cannot be null, please try sbvtCapture('Example name')")})(); //check for file name and then assign to global let
    imageType = (options && options.capture) ? options.capture : imageType;  //pass through options.capture if provided

    if (options && options.onAfterScreenshot || options && options.onBeforeScreenshot) cy.task('logger', {type: 'warn', message: `'${imageName}': Callback functions are not supported.`});

    const modifiedOptions = options ? Object.assign(options, func) : func

    cy.task('logger', {type: 'trace', message: `Beginning sbvtCapture('${name}')`});
    if (element) cy.task('logger', {type: 'trace', message: 'This is chained and there is an "element" value'});

    return cy.task('postTestRunId').then((taskData) => {
        vtConfFile = taskData; //grab visualTest.config.js data
        takeScreenshot(element, name, modifiedOptions);
    }).then(() => {
        return apiRes
    });
});
let takeScreenshot = (element, name, modifiedOptions) => {
    if (vtConfFile.fail) {
        console.log('The sbvtScreenshot() has failed');
        cy.task('logger', {type: 'trace', message: `sbvtCapture() has failed`}); //I dont think this should be printed out each screenshot
    } else if (element) {
        cy.task('logger', {type: 'trace', message: `Before element cy.screenshot('${name}')`});
        cy.get(element).screenshot(
            name,
            modifiedOptions,
            imageType = 'element'
        ).then(() => {
            userAgent();
            domCapture();
            picFileFormat();
        });
    } else if (modifiedOptions.capture === 'viewport') {
        cy.task('logger', {type: 'trace', message: `Before viewport cy.screenshot('${name}')`});
        cy.screenshot(
            name,
            modifiedOptions,
        ).then(() => {
            userAgent();
            domCapture();
            picFileFormat();
        });
    } else {
        cy.task('logger', {type: 'debug', message: `Before fullpage cy.screenshot('${name}')`});
        let initialPageState;
        cy.window()
            .then((win) => {
                cy.task('logger', {type: 'trace', message: `Before win.eval`});
                initialPageState = win.eval(`inBrowserInitialPageState = {"scrollX": window.scrollX,"scrollY": window.scrollY,"overflow": document.body.style.overflow,"transform": document.body.style.transform}`)
                win.eval(`document.body.style.transform="translateY(0)"`)
                cy.task('logger', {type: 'trace', message: `After win.eval`});

                cy.screenshot(
                    name,
                    modifiedOptions,
                ).then(() => {
                    userAgent();
                    domCapture();
                    picFileFormat();

                    cy.task('logger', {type: 'trace', message: `document.body.style.transform='${initialPageState.transform}'`});
                    cy.task('logger', {type: 'trace',message: `window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`});
                    cy.task('logger', {type: 'trace',message: `document.body.style.overflow='${initialPageState.overflow}'`});

                    win.eval(`document.body.style.transform='${initialPageState.transform}'`)
                    win.eval(`window.scrollTo(${initialPageState.scrollX}, ${initialPageState.scrollY})`)
                    win.eval(`document.body.style.overflow='${initialPageState.overflow}'`)

                    cy.task('logger', {type: 'trace', message: `After fullpage cy.screenshot('${name}')`});
                });
            })
    }
};

let sendImageApiJSON = () => {
    cy.request({
        method: "POST",
        url: `${vtConfFile.url}/api/v1/projects/${vtConfFile.projectId}/testruns/${vtConfFile.testRunId}/images`,
        headers: {"Authorization": `Bearer ${vtConfFile.projectToken}`},
        failOnStatusCode: false,
        body: {
            "imageHeight": picProps.dimensions.height,
            "imageWidth": picProps.dimensions.width,
            "screenHeight": userAgentData.screenHeight,
            "screenWidth": userAgentData.screenWidth,
            "viewportHeight": picElements[0].clientHeight,
            "viewportWidth": picElements[0].clientWidth,
            "sessionId": vtConfFile.sessionId,
            "imageType": imageType.toLowerCase(),
            "imageName": imageName,
            "deviceType": userAgentData.deviceType,
            "browserName": userAgentData.browserName,
            "browserVersion": Cypress.browser.majorVersion,
            "browserFullVersion": userAgentData.browserVersion,
            "osName": userAgentData.osName,
            "osVersion": userAgentData.osVersion,
            "devicePixelRatio": picProps.pixelRatio,
            "imageExt": "png",
            "testUrl": picElements[0].baseURI,
            "dom": dom
        },
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
let userAgent = () => {
    cy.window()
        .then((win) => {
            userAgentData = win.eval(toolkitScripts.userAgentScript)
        });
};
let domCapture = () => {
    cy.window()
        .then((win) => {
            dom = win.eval(toolkitScripts.captureDomScript)
        });
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