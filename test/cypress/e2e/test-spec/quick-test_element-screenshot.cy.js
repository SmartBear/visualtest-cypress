const testCases = [
    // {
    //     'name': 'Example1-Original-Product-Item',
    //     'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
    //     'actions': [],
    //     'cssSelector': 'section.product_section.layout_padding > div > div.row > div:nth-child(1)',
    // },
    // {
    //     'name': 'Example2-Original-Side-Panel',
    //     'url': 'https://smartbear.github.io/visual-testing-example-website/Example2/Original/index.html',
    //     'actions': [
    //         {
    //             'action': 'click',
    //             'cssSelector': '.openbtn'
    //         }
    //     ],
    //     'cssSelector': '#mySidepanel'
    // },
    // {
    //     'name': 'Example3-Original-Pages-Menu',
    //     'url': 'https://smartbear.github.io/visual-testing-example-website/Example3/Original/index.html',
    //     'actions': [
    //         {
    //             'action': 'hover',
    //             'cssSelector': 'li.has-sub > a'
    //         }
    //     ],
    //     'cssSelector': 'li.has-sub > ul'
    // },
    {
        'name': 'Example4-Original-Login-Form',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example4/Original/login.html',
        'actions': [],
        'cssSelector': '.ud-login-wrapper'
    }
]

const getDescribeTitle = require('../../../utils/getDescribeTitle')

Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

const insertCustomFreezeScript = true;
testCases.forEach(currentTestCase => {
    describe(getDescribeTitle(Cypress.spec.name, currentTestCase), () => {
        let dataFromTest;
        it(`should take sbvtCapture`, () => {
            cy.visit(currentTestCase.url).then(() => {
                currentTestCase.options ? '' : currentTestCase.options = {}
                
                currentTestCase.options.comparisonMode = 'layout'
                currentTestCase.options.sensitivity = 'low'
                cy.wait(1500);
                if (currentTestCase.actions && currentTestCase.actions.length > 0) {
                    if (currentTestCase.actions[0].action === 'click') {
                        cy.get(currentTestCase.actions[0].cssSelector).click();
                        cy.get(currentTestCase.cssSelector).sbvtCapture(currentTestCase.name, currentTestCase.options).then((data) => {
                            dataFromTest = data;
                        })
                    } else if (currentTestCase.actions[0].action === 'hover') {
                        //cypress does not handle hovers
                    }
                } else {
                    cy.window()
                        .then((win) => {
                            cy.readFile("./utils/exampleFreezeCarousel.js").then((str) => {
                                if (insertCustomFreezeScript) win.eval(str);

                                cy.get(currentTestCase.cssSelector).sbvtCapture(currentTestCase.name, currentTestCase.options).then((data) => {
                                    dataFromTest = data;
                                    // cy.task('log', {message: dataFromTest});
                                    // cy.wait(500)
                                })
                            })
                        })
                }
            })
        })
        it(`dom should have correct data`, () => {
            assert(dataFromTest, 'dataFromTest');
            assert(dataFromTest.screenshotResult, 'screenshotResult is missing');
            assert(dataFromTest.screenshotResult.dom, 'DOM is missing');
            assert(dataFromTest.screenshotResult.dom.error === false, 'DOM capture has an error');
            assert(dataFromTest.screenshotResult.dom.fullpage.width && dataFromTest.screenshotResult.dom.fullpage.height, 'DOM capture doesnt have fullpage width and height');
            assert(dataFromTest.screenshotResult.dom.viewport.width && dataFromTest.screenshotResult.dom.viewport.height, 'DOM capture doesnt have viewport width and height');
            assert(dataFromTest.screenshotResult.dom.devicePixelRatio >= 1, 'DOM capture invalid devicePixelRatio');
            assert(dataFromTest.screenshotResult.dom.dom.length >= 1, 'DOM elements missing');
            assert(dataFromTest.imageApiResult.imageType === 'element', `DOM screenshotType invalid: ${dataFromTest.imageApiResult.imageType}`);
        })
    })
})
