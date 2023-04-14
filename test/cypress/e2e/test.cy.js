Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe(`running example 1`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example1', {
            // scroll: "JS"
            lazyload: 250,
            saveDOM: true,
        })
    });
})

describe(`running example 2`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example2', {
            // scroll: "JS"
            // lazyload: 750,
            saveDOM: true,
        })
    });
})
//
describe(`running example 3`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example3', {
            // scroll: "JS"
            // lazyload: 750,
            saveDOM: true,
        })
    });
})

describe(`running example 4`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example4', {
            // scroll: "JS",
            // lazyload: 750,
            // saveDOM: true
        })
    });
})

describe(`running example 5`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example5', {
            // scroll: "JS",
            // lazyload: 750,
            saveDOM: true,
        })
    });
})

describe(`running example 6`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example6', {
            // scroll: "JS"
            // lazyload: 750,
            saveDOM: true
        })
    });
});