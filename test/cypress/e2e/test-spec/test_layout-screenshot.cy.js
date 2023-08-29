const testCases = [
    {
        'name': 'Example1-Original-NoOptions',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {}
    },
    {
        'name': 'Example1-Original-Detailed',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {
            'comparisonMode': 'detailed'
        }
    },
    {
        'name': 'Example1-Original-LayoutMedium',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {
            'comparisonMode': 'layout',
            'sensitivity': 'medium'
        }
    }
];

const getDescribeTitle = require('../../../utils/getDescribeTitle');

Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
});

const insertCustomFreezeScript = true;
testCases.forEach(currentTestCase => {
    let dataFromTest;
    describe(getDescribeTitle(Cypress.spec.name, currentTestCase), () => {
        it(`should take sbvtCapture`, () => {
            cy.visit(currentTestCase.url).then(() => {
                
                cy.wait(1500);
                cy.window()
                    .then((win) => {
                        cy.readFile("./utils/exampleFreezeCarousel.js").then((str) => {
                            if (insertCustomFreezeScript) win.eval(str);
                            cy.sbvtCapture(currentTestCase.name, currentTestCase.options).then((data) => {
                                dataFromTest = data;
                            });
                        });
                    });
            });
        });
        it(`dom should have correct data`, () => {
            assert(dataFromTest.screenshotResults.dom, 'DOM is missing');
            assert(dataFromTest.screenshotResults.dom.error === false, 'DOM capture has an error');
            assert(dataFromTest.screenshotResults.dom.fullpage.width && dataFromTest.screenshotResults.dom.fullpage.height, 'DOM capture doesnt have fullpage width and height');
            assert(dataFromTest.screenshotResults.dom.viewport.width && dataFromTest.screenshotResults.dom.viewport.height, 'DOM capture doesnt have viewport width and height');
            assert(dataFromTest.screenshotResults.dom.devicePixelRatio >= 1, 'DOM capture invalid devicePixelRatio');
            assert(dataFromTest.screenshotResults.dom.dom.length >= 1, 'DOM elements missing');
            assert(dataFromTest.imageApiResult.imageType === 'fullpage', `DOM screenshotType invalid: ${dataFromTest.imageApiResult.imageType}`);
        })

        it(`apiPostResult should prove that layout mode is sent correctly`, () => {
            const sensitivityMap = {
                low: 0,
                medium: 1,
                high: 2
            };

            if (currentTestCase.options.comparisonMode) {
                assert(dataFromTest.imageApiResult.comparisonMode === currentTestCase.options.comparisonMode, `Capture had comparisonMode: ${currentTestCase.options.comparisonMode}, but dataFromTest.imageApiResult.comparisonMode was: ${dataFromTest.imageApiResult.comparisonMode}`);
                if (currentTestCase.options.sensitivity) {
                    const expectedSensitivity = sensitivityMap[currentTestCase.options.sensitivity];
                    const actualSensitivity = dataFromTest.imageApiResult.sensitivity;
                    assert(actualSensitivity === expectedSensitivity, `Capture had sensitivity: [${currentTestCase.options.sensitivity} or mapped-out: ${sensitivityMap[currentTestCase.options.sensitivity]}], but dataFromTest.imageApiResult.sensitivity was: ${dataFromTest.imageApiResult.sensitivity}`);
                } else {
                    assert(dataFromTest.imageApiResult.sensitivity === null, `Capture had no sensitivity sent, so sensitivity should have been null, instead it was: ${dataFromTest.imageApiResult.sensitivity}`);

                }
            } else {
                assert(dataFromTest.imageApiResult.sensitivity === null, `Capture had comparisonMode: ${dataFromTest.imageApiResult.sensitivity}, but no comparisonMode sent, so response should have been null`);
            }
        });

    });
});


