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
        it(`return object should have correct data`, () => {
            const fullPageViolations = dataFromTest.imageApiResult.violations

            assert(Array.isArray(fullPageViolations), 'fullPageViolations should be an array');

            fullPageViolations.forEach(violation => {
                assert(violation.hasOwnProperty('description'), 'violation should have a description property');
                assert(violation.hasOwnProperty('help'), 'violation should have a help property');
                assert(violation.hasOwnProperty('helpUrl'), 'violation should have a helpUrl property');
                assert(violation.hasOwnProperty('id'), 'violation should have an id property');
                assert(violation.hasOwnProperty('impact'), 'violation should have an impact property');
                assert(violation.hasOwnProperty('boundingBox'), 'violation should have a boundingBox property');

                // Check if boundingBox has the required properties
                assert(violation.boundingBox.hasOwnProperty('x'), 'boundingBox should have an x property');
                assert(violation.boundingBox.hasOwnProperty('y'), 'boundingBox should have a y property');
                assert(violation.boundingBox.hasOwnProperty('width'), 'boundingBox should have a width property');
                assert(violation.boundingBox.hasOwnProperty('height'), 'boundingBox should have a height property');
                assert(violation.boundingBox.hasOwnProperty('target'), 'boundingBox should have a target property');
                assert(violation.boundingBox.hasOwnProperty('html'), 'boundingBox should have an html property');
            });        })

    });
});


