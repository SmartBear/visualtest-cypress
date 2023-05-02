const testCases = [
    {
        'name': 'Example1-Original-Top-Viewport',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {'viewport': true}
    },
    {
        'name': 'Example1-Original-Scrolled-1-Viewport',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {'viewport': true},
        'scrollViewport': {
            'script': 'window.scrollTo(0, window.innerHeight)', //scroll viewport down
        }
    },
    {
        'name': 'Example1-Original-Scrolled-2-Viewports',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {'viewport': true},
        'scrollViewport': {
            'script': 'window.scrollTo(0, window.innerHeight*2)', //scroll viewport down
        }
    }
]

const getDescribeTitle = require('../../../bin/getDescribeTitle')
const flattenTree = dom => {
    const flat = [];
    const traverse = node => {
        if (node == null) {
            console.log('node is null')
            return;
        }
        if (node.children) {
            node.children.forEach(child => {
                traverse(child);
            })
            delete node.children;
            flat.push(node);
        } else {
            flat.push(node);
        }
    }

    traverse(dom);
    return flat;
}
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

const insertCustomFreezeScript = true;
testCases.forEach(currentTestCase => {
    let dataFromTest;
    let scrolledTo;
    describe(getDescribeTitle(Cypress.spec.name, currentTestCase), () => {
        it(`should take sbvtCapture`, () => {
            cy.visit(currentTestCase.url).then(() => {
                if (currentTestCase.options.viewport) currentTestCase.options.capture = 'viewport'
                currentTestCase.options.saveDOM = true;

                cy.wait(1500);

                    cy.window()
                        .then((win) => {
                            cy.readFile("./exampleFreezeCarousel.js").then((str) => {
                                if (insertCustomFreezeScript) win.eval(str);
                                const viewportHeight = win.eval('window.innerHeight')
                                if (currentTestCase.scrollViewport) {
                                    if (currentTestCase.scrollViewport.script.includes("*2")) {
                                        cy.scrollTo(0, viewportHeight*2)
                                        scrolledTo = viewportHeight*2
                                    } else {
                                        cy.scrollTo(0, viewportHeight)
                                        scrolledTo = viewportHeight
                                    }
                                }
                                    cy.sbvtCapture(currentTestCase.name, currentTestCase.options).then((data) => {
                                        dataFromTest = data;
                                    })
                            })
                        })

            })
        })
        it(`dom should have correct data`, () => {
            assert(dataFromTest.dom, 'DOM is missing');
            assert(dataFromTest.dom.error === false, 'DOM capture has an error');
            assert(dataFromTest.dom.fullpage.width && dataFromTest.dom.fullpage.height, 'DOM capture doesnt have fullpage width and height');
            assert(dataFromTest.dom.viewport.width && dataFromTest.dom.viewport.height, 'DOM capture doesnt have viewport width and height');
            assert(dataFromTest.dom.devicePixelRatio >= 1, 'DOM capture invalid devicePixelRatio');
            assert(dataFromTest.dom.dom.length >= 1, 'DOM elements missing');
            assert(dataFromTest.imageApiResult.imageType === 'viewport', `DOM screenshotType invalid: ${dataFromTest.imageApiResult.imageType}`);
        })
        if (currentTestCase.scrollViewport) {
            it(`make sure that the scrolled viewport is reported on the dom`, () => {
                assert(dataFromTest.dom.viewport.top === scrolledTo, "viewport.top in DOM capture did not match expected scroll position for viewport")
            })
        }
    })
})
