const resolutions = ['1024x768', '1496x967', '1920x1080']
const testCases = [
    {
        'name': 'Example1-Original',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
        'options': {
            'ignoreElements': ['.carousel.slide']
        }
    },
    {
        'name': 'Example2-Original',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example2/Original/index.html',
        'options': {}
    },
    {
        'name': 'Example3-Original',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example3/Original/index.html',
        'options': {}
    },
    {
        'name': 'Example4-Original',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example4/Original/index.html',
        'options': {
            'lazyload': 1000
        },
        'validation': {
            'elements': [
                { // should have 27 elements with class fadeInUp and all should be visible
                    'class': 'fadeInUp',
                    'count': 27,
                    'styles': {
                        'visibility': 'visible',
                    }
                }
            ]
        }
    },
    {
        'name': 'Example5-Original',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example5/Original/index.html',
        'options': {}
    },
    {
        'name': 'Example6-Original',
        'url': 'https://smartbear.github.io/visual-testing-example-website/Example6/Original/index.html',
        'options': {
            'lazyload': 1000
        },
        'validation': {
            'elements': [
                {
                    'class': 'fadeInUp',
                    'count': 12,
                    'styles': {
                        'visibility': 'visible',
                    }
                },
                {
                    'class': 'fadeInLeft',
                    'count': 10,
                    'styles': {
                        'visibility': 'visible',
                    }
                },
                {
                    'class': 'fadeInRight',
                    'count': 3,
                    'styles': {
                        'visibility': 'visible',
                    }
                }
            ]
        }
    }
]

const getDescribeTitle = require('../../../utils/getDescribeTitle')
const flattenDom = require('../../../utils/falttenDom')

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
                    currentTestCase.options.debug = true;
                    cy.wait(1500);
                    cy.window()
                        .then((win) => {
                            cy.readFile("./utils/exampleFreezeCarousel.js").then((str) => {
                                if (insertCustomFreezeScript) win.eval(str);
                                cy.sbvtCapture(currentTestCase.name, currentTestCase.options).then((data) => {
                                    dataFromTest = data;
                                })
                            })
                        })
                })
            })
            it(`dom should have correct data`, () => {
                assert(dataFromTest.dom, 'DOM missing from result')
                assert(dataFromTest.dom.error === false, 'DOM capture has an error');
                assert(dataFromTest.dom.fullpage.width && dataFromTest.dom.fullpage.height, 'DOM capture doesnt have fullpage width and height');
                assert(dataFromTest.dom.viewport.width && dataFromTest.dom.viewport.height, 'DOM capture doesnt have viewport width and height');
                assert(dataFromTest.dom.devicePixelRatio >= 1, 'DOM capture invalid devicePixelRatio');
                assert(dataFromTest.dom.dom.length >= 1, 'DOM elements missing');
            })
            if (currentTestCase.options.ignoreElements) {
                it(`check that the dom has the cssSelectors in the ignoredElements`, () => {
                    assert(dataFromTest.dom, 'dom missing from result')
                    assert(dataFromTest.dom.ignoredElementsData, 'ignoredElementsData missing from dom');
                    const ignoredElements = dataFromTest.dom.ignoredElementsData;
                    assert(Array.isArray(ignoredElements), 'ignoredElements on image API result was not an array');
                    assert(ignoredElements.length > 0, 'ignoredElementsData is an empty array');
                    assert(currentTestCase.options.ignoreElements.every(selector => ignoredElements.some(el => el.cssSelector === selector)), 'ignoreElements cssSelectors requested did not match found ignoredElements cssSelectors');
                })
                it(`filter through the flat dom and make sure there are some cases of ignore: true`, () => {
                    const flatDom = flattenDom(dataFromTest.dom.dom[0])
                    const elementsToBeIgnored = flatDom.filter(el => el.ignore)
                    assert(elementsToBeIgnored.length >= currentTestCase.options.ignoreElements.length, 'There are less elements ignored than testCase ignoreElements.length');
                })
                it(`check that the image API result has the cssSelectors in the ignoredElements`, () => {
                    assert(dataFromTest.imageApiResult, 'imageApiResult missing from API result');
                    assert(dataFromTest.imageApiResult.ignoredElements, 'ignoredElements property missing from API result');
                    const ignoredElements = dataFromTest.imageApiResult.ignoredElements;
                    assert(Array.isArray(ignoredElements), 'ignoredElements on image API result was not an array');
                    assert(ignoredElements.length > 0, 'ignoredElements on image API result was an empty array');
                    assert(currentTestCase.options.ignoreElements.every(selector => ignoredElements.some(el => el.cssSelector === selector)), 'ignoreElements cssSelectors requested did not match found ignoredElements cssSelectors');
                })
            } else {
                it(`check that the dom.ignoredElements is empty`, () => {
                    assert(dataFromTest.dom.ignoredElementsData, 'ignoredElementsData missing from dom');
                    const ignoredElements = dataFromTest.dom.ignoredElementsData;
                    assert(Array.isArray(ignoredElements), 'ignoredElementsData on image API result was not an array');
                    assert(ignoredElements.length === 0, 'ignoredElementsData is not empty');
                })
                it(`check that the image API result on ignoredElements is empty`, () => {
                    assert(dataFromTest.imageApiResult, 'imageApiResult missing from API result');
                    assert(dataFromTest.imageApiResult.ignoredElements, 'ignoredElements property missing from API result');
                    const ignoredElements = dataFromTest.imageApiResult.ignoredElements;
                    assert(Array.isArray(ignoredElements), 'ignoredElements on image API result was not an array');
                    assert(ignoredElements.length === 0, 'ignoredElements on image API result was not an empty array');
                })
            }
            if (currentTestCase.validation) {
                it(`dom should prove lazyload is working`, () => {
                    const flatDom = flattenDom(dataFromTest.dom.dom[0])
                    // go through all the elements in the testCases JSON
                    currentTestCase.validation.elements.forEach(currentElementOnTestcase => {
                        // filter through the flatDom for cssSelectors on it, that match the testcase
                        const matchingElementsOnDom = flatDom.filter(el => el.attrs && el.attrs.class && el.attrs.class.includes(currentElementOnTestcase.class))
                        assert(matchingElementsOnDom.length === currentElementOnTestcase.count, `DOM did not have ${currentElementOnTestcase.count} elements matching class: "${currentElementOnTestcase.class}", had ${matchingElementsOnDom.length}.`);
                        matchingElementsOnDom.forEach(matchedElementOnDom => {
                            assert(matchedElementOnDom.styles.visibility === currentElementOnTestcase.styles.visibility, `Element "${matchedElementOnDom.attrs.class}" had "${matchedElementOnDom.styles.visibility}" visibility.`);
                        })
                    })
                })
            }
        })
    })
})


