const resolutions = ['1024x768', '1496x967', '1920x1080']
const testCases = [
    {
        'name': 'Example1-Original-Product-Item',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'actions': [],
        'cssSelector': 'section.product_section.layout_padding > div > div.row > div:nth-child(1)',
    },
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
    // {
    //     'name': 'Example4-Original-Login-Form',
    //     'url': 'https://smartbear.github.io/visual-testing-example-website/Example4/Original/login.html',
    //     'actions': [],
    //     'cssSelector': '.ud-login-wrapper'
    // }
]

const getDescribeTitle = require('../../../utils/getDescribeTitle')

Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

const insertCustomFreezeScript = true;
resolutions.forEach(widthHeight => {
    const [width, height] = widthHeight.split('x');
    testCases.forEach(currentTestCase => {
        let dataFromTest;
        describe(getDescribeTitle(Cypress.spec.name, currentTestCase), () => {
            it(`should take sbvtCapture`, () => {
                cy.viewport(parseInt(width), parseInt(height))
                cy.visit(currentTestCase.url).then(() => {
                    currentTestCase.options ? '' : currentTestCase.options = {}
                    
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
                                    })
                                })
                            })
                    }
                })
            })
            it(`dom should have correct data`, () => {
                assert(dataFromTest.screenshotResults.dom, 'DOM is missing');
                assert(dataFromTest.screenshotResults.dom.error === false, 'DOM capture has an error');
                assert(dataFromTest.screenshotResults.dom.fullpage.width && dataFromTest.screenshotResults.dom.fullpage.height, 'DOM capture doesnt have fullpage width and height');
                assert(dataFromTest.screenshotResults.dom.viewport.width && dataFromTest.screenshotResults.dom.viewport.height, 'DOM capture doesnt have viewport width and height');
                assert(dataFromTest.screenshotResults.dom.devicePixelRatio >= 1, 'DOM capture invalid devicePixelRatio');
                assert(dataFromTest.screenshotResults.dom.dom.length >= 1, 'DOM elements missing');
                assert(dataFromTest.imageApiResult.imageType === 'element', `DOM screenshotType invalid: ${dataFromTest.imageApiResult.imageType}`);
            })
        })
    })
})
