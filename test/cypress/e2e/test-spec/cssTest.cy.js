Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})
let freezePage = true;

describe(`Tests the automatically inserted freezePage script (unless turned off). freezePage is: ${freezePage}`, () => {
    // it('should take a fullpage on: css-animation1', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation1/index.html')
    //     cy.sbvtCapture("css-animation1", {
    //         freezePage,
    //     })
    // })
    // it('should take a fullpage on: css-animation2', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation2/index.html')
    //     cy.sbvtCapture("css-animation2", {
    //         freezePage,
    //         // saveDom: true,
    //         // lazyload: 500
    //     })
    // })
    it('should take a fullpage on: css-animation3', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation3/index.html')
        cy.sbvtCapture("css-animation3", {
            freezePage,
            // saveDom: true,
            // lazyload: 500
        })
    })
    // it('should take a fullpage on: css-animation4', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation4/index.html')
    //     cy.sbvtCapture("css-animation4", {
    //         freezePage,
    //         // saveDom: true,
    //         // lazyload: 500
    //     })
    // })
    // it('should take a fullpage on: css-animation5', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation5/index.html')
    //     cy.sbvtCapture("css-animation5", {
    //         freezePage,
    //         // saveDom: true,
    //         lazyload: 500
    //     })
    // })
    // it('should take a fullpage on: css-animation6', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation6/index.html')
    //     cy.sbvtCapture("css-animation6", {
    //         freezePage,
    //         // saveDom: true,
    //         // lazyload: 500
    //     })
    // })
    // it('should take a fullpage on: css-animation7', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation7/index.html')
    //     cy.wait(10)
    //     cy.sbvtCapture("css-animation7", {
    //         freezePage,
    //         // saveDom: true,
    //         // lazyload: 500,
    //         // scrollMethod: "JS_SCROLL"
    //     })
    // })
    // it('should take a fullpage on: css-animation8', () => {
    //     cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/css-animation8/index.html')
    //     cy.sbvtCapture("css-animation8", {
    //         freezePage,
    //         // saveDom: true,
    //         lazyload: 500
    //     })
    // })
    it('should take a fullpage on: gif-image1', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/gif-image1/index.html')
        cy.sbvtCapture("gif-image1", {
            freezePage,
            // saveDom: true,
            lazyload: 500
        })
    })
    it('should take a fullpage on: gif-background-image1', () => {
        cy.visit('https://smartbear.github.io/visual-testing-example-website/sdk-testcases/gif-background-image1/index.html')
        cy.sbvtCapture("gif-background-image1", {
            freezePage,
            // saveDom: true,
            // lazyload: 500
        })
    })
})
