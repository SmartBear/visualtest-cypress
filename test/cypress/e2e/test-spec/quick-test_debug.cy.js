// This file is finicky - Trevor
Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
});


describe('debug folder test', () => {
    let url = "https://smartbear.github.io/visual-testing-example-website/Example4/Original/login.html";
    it(`should take all the sbvtCaptures`, () => {
        cy.visit(url).then(() => {
            cy.sbvtCapture("debug-viewport",
                {
                    capture: "viewport"
                });
            cy.sbvtCapture("debug-default-fullpage",
                {
                    scrollMethod: "JS_SCROLL"
                });
            cy.get(".ud-login-wrapper").sbvtCapture('debug-element');
            cy.sbvtCapture("debug-fullpage");
        });
    });
    let directoryPath;
    it(`Get sbvt_debug folder`, () => {
        // cy.task('logger', {type: 'fatal', message: Cypress.config().fileServerFolder});
        const parentDirectory = `${Cypress.config().fileServerFolder}/sbvt_debug`;
        cy.exec(`ls -t1 ${parentDirectory} | head -n 1`)
            .its('stdout')
            .then(directoryName => {
                directoryPath = `${parentDirectory}/${directoryName}`;
                cy.task('logger', {type: 'warn', message: `directoryPath: ${directoryPath} `});
            });
    });

    //log file check
    it(`Should check for logs`, () => {
        cy.readFile(`${directoryPath}/debug.log`).then((logFile) => {
            assert(logFile.length > 8000, `length not greater than 8000, the logFile.length was: ${logFile.length}, this seems too small, it was 8465 when I tested myself `);
        });
    });

    //viewport image debug check
    it(`Should check viewport dom capture`, () => {
        cy.readFile(`${directoryPath}/debug-viewport-viewport/debug-viewport.json`).then((jsonFile) => {
            assert(jsonFile.error === false, 'DOM capture has an error');
            assert(jsonFile.url === url, 'Urls did not match');
        });
    });
    it(`Should check viewport image capture`, () => {
        cy.readFile(`${directoryPath}/debug-viewport-viewport/debug-viewport.png`);
    });

    // JS_SCROLL debug check
    it(`Should check JS_SCROLL-fullpage dom capture`, () => {
        cy.readFile(`${directoryPath}/debug-default-fullpage-fullPage/debug-default-fullpage.json`).then((jsonFile) => {
            assert(jsonFile.error === false, 'DOM capture has an error');
            assert(jsonFile.url === url, 'Urls did not match');
        });
    });
    it(`Should check JS_SCROLL-fullpage image capture`, () => {
        cy.readFile(`${directoryPath}/debug-default-fullpage-fullPage/debug-default-fullpage.png`);
    });

    // element capture test
    it(`Should check element dom capture`, () => {
        cy.readFile(`${directoryPath}/debug-element-element/debug-element.json`).then((jsonFile) => {
            assert(jsonFile.error === false, 'DOM capture has an error');
            assert(jsonFile.url === url, 'Urls did not match');
        });
    });
    it(`Should check element image capture`, () => {
        cy.readFile(`${directoryPath}/debug-element-element/debug-element.png`);
    });


    // sbvtCapture fullpage
    it(`Should check fullpage dom capture`, () => {
        cy.readFile(`${directoryPath}/debug-fullpage-fullPage/debug-fullpage.json`).then((jsonFile) => {
            assert(jsonFile.error === false, 'DOM capture has an error');
            assert(jsonFile.url === url, 'Urls did not match');
        });
    });
    it(`Should check fullpage image capture`, () => {
        cy.readFile(`${directoryPath}/debug-fullpage-fullPage/debug-fullpage.png`);
    });
});