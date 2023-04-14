
// Run against EXAMPLE 7 and all test should pass
// it is KNOWN that example 2 might have comparison failure, as the scroll bar does not go away

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

// describe(`running example 1`, () => {
//     beforeEach('visit', () => {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     win.eval(str)
//                 })
//             })
//     })
//     it('should take a fullpage sbvtCapture', function () {
//         cy.sbvtCapture('example 1', {
//             lazyload: 750,
//         })
//     });
// })

describe(`running example 2`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/Original/index.html`)
        cy.window()
            .then((win) => {
                cy.readFile("./exampleFreezeCarousel.js").then((str) => {
                    win.eval(str)
                })
            })
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 2', {
            lazyload: 750,
        })
    });
})

describe(`running example 3`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/Original/index.html`)
        cy.window()
            .then((win) => {
                cy.readFile("./exampleFreezeCarousel.js").then((str) => {
                    win.eval(str)
                })
            })
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('example 3', {
            lazyload: 750,
        })
    });
})
//
// describe(`running example 4`, () => {
//     beforeEach('visit', () => {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/Original/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     win.eval(str)
//                 })
//             })
//     })
//     it('should take a fullpage sbvtCapture', function () {
//         cy.sbvtCapture('example 4', {
//             lazyload: 750,
//         })
//     });
// })
//
// describe(`running example 5`, () => {
//     beforeEach('visit', () => {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/Original/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     win.eval(str)
//                 })
//             })
//     })
//     it('should take a fullpage sbvtCapture', function () {
//         cy.sbvtCapture('example 5', {
//             lazyload: 750,
//         })
//     });
// })
//
// describe(`running example 6`, () => {
//     beforeEach('visit', () => {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/Original/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     win.eval(str)
//                 })
//             })
//     })
//     it('should take a fullpage sbvtCapture', function () {
//         cy.sbvtCapture('example 6', {
//             lazyload: 750,
//         })
//     });
// });

