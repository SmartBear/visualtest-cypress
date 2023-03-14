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
        cy.sbvtCapture('1example 1 lazyloaded 750ms', {
            lazyload: 750,
            script: "./exampleFreezePage.js"
        })
    });
})

describe(`running example 2`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 2 lazyloaded 750ms', {
            lazyload: 750,
            script: "./exampleFreezePage.js"
        })
    });
})

describe(`running example 3`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 3 lazyloaded 750ms-2', {
            lazyload: 750,
            script: "./exampleFreezePage.js"
        })
    });
})

describe(`running example 4`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 4 lazyloaded 750ms', {
            lazyload: 750,
            script: "./exampleFreezePage.js"
        })
    });
})

describe(`running example 5`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 5 lazyloaded 750ms', {
            lazyload: 750,
            script: "./exampleFreezePage.js"
        })
    });
})

describe(`running example 6`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 6 lazyloaded 750ms', {
            lazyload: 750,
            script: "./exampleFreezePage.js"
        })
    });
});

