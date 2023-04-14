Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})
describe(`infinite scroll`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/infinite-scroll/index.html`)
        // cy.visit(`https://www.google.com`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('infinite-scroll', {
            // lazyload: 750,
            saveDOM: true,
            // scrollMethod: "JS_SCROLL"
        })
    });
})

describe(`running section-wipes`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/section-wipes/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('section-wipes', {
            // lazyload: 750,
            // scrollMethod: "JS_SCROLL",
            saveDOM: true
        })
    });
})

describe(`running carousel`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/carousel/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('carousel', {
            // lazyload: 750,
            // scrollMethod: "JS_SCROLL",
            saveDOM: true
        })
    });
})

describe(`running css-animation1`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation1/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('css-animation1', {
            // lazyload: 750,
            // scrollMethod: "JS_SCROLL",
            saveDOM: true
        })
    });
})

describe(`running css-animation2`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation2/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('css-animation2', {
            // lazyload: 750,
            // scrollMethod: "JS_SCROLL",
            saveDOM: true
        })
    });
})

describe(`running css-animation3`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation3/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('css-animation3', {
            // lazyload: 500,
            scrollMethod: "JS_SCROLL",
            saveDOM: true
        })
    });
})

describe(`running css-animation4`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation4/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('css-animation4', {
            lazyload: 500,
            // scrollMethod: "JS_SCROLL",
            saveDOM: true
        })
    });
})