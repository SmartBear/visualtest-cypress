Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})
describe('Tests the freezePage script', () => {
    it('Tests css-animation1', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation1/index.html')
        cy.sbvtCapture("css-animation1", {
            // saveDom: true,
        })
    })
    it('Tests css-animation2', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation2/index.html')
        cy.sbvtCapture("css-animation2", {
            // saveDom: true,
            // lazyload: 500
        })
    })
    it('Tests css-animation3', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation3/index.html')
        cy.sbvtCapture("css-animation3", {
            // saveDom: true,
            // lazyload: 500
        })
    })
    it('Tests css-animation4', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation4/index.html')
        cy.sbvtCapture("css-animation4", {
            // saveDom: true,
            // lazyload: 500
        })
    })
    it('Tests css-animation5', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation5/index.html')
        cy.sbvtCapture("css-animation5", {
            // saveDom: true,
            lazyload: 500
        })
    })
    it('Tests css-animation6', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation6/index.html')
        cy.sbvtCapture("css-animation6", {
            // saveDom: true,
            // lazyload: 500
        })
    })
    it('Tests css-animation7', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation7/index.html')
        cy.wait(10)
        cy.sbvtCapture("css-animation7", {
            // saveDom: true,
            // lazyload: 500,
            // scrollMethod: "JS_SCROLL"
        })
    })
    it('Tests css-animation8', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation8/index.html')
        cy.sbvtCapture("css-animation8", {
            // saveDom: true,
            lazyload: 500
        })
    })
    it('Tests gif-image1', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/gif-image1/index.html')
        cy.sbvtCapture("gif-image1", {
            // saveDom: true,
            lazyload: 500
        })
    })
    it('Tests gif-background-image1', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/gif-background-image1/index.html')
        cy.sbvtCapture("gif-background-image1", {
            // saveDom: true,
            // lazyload: 500
        })
    })
})
