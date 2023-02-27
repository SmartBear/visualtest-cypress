describe(`running example 4`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/Original/index.html`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 4 lazyloaded 750ms', {
            lazyload: 750
        })
    });
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 4 lazyloaded 150ms', {
            lazyload: 150
        })
    });
    it('should take a regular fullpage sbvtCapture', function () {
        cy.sbvtCapture('regular example 4')
    });
})

describe(`running apple.com`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://www.apple.com`)
    })
    it('should take a regular fullpage sbvtCapture', function () {
        cy.sbvtCapture('regular apple')
    });
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('apple lazyloaded 750ms', {
            lazyload: 250
        })
    });
})

describe(`running apple.com iphone 14`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://www.apple.com/iphone-14-pro/`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('apple iphone 14 lazyloaded 500ms', {
            lazyload: "600"
        })
        cy.sbvtCapture('apple iphone 14 regular')
    });
})
