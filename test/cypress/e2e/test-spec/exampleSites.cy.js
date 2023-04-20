// Cypress.on('uncaught:exception', (err, runnable) => {
//     // returning false here prevents Cypress from
//     // failing the test
//     return false
// })
//
// const basePage = true
// const insertCustomFreezeScript = true
//
// describe(`Test lazyload and overall function. Insert freezeCarousel script then take a screenshot. basePage is: ${basePage}. insertCustomFreezeScript is: ${insertCustomFreezeScript}`, () => {
//     it(`should take a fullpage, viewport and element capture on: Example1/${basePage ? "Original": "ColorDiff"}`, function () {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/${ basePage ? `Original` : `ColorDiff`}/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     insertCustomFreezeScript ? win.eval(str) : ''
//                 })
//             })
//         cy.sbvtCapture('Example1-ColorDiff', {
//             // lazyload: 500,
//             saveDOM: true,
//         })
//         cy.sbvtCapture('Example1-ColorDiff-viewport', {
//             capture: "viewport"
//         })
//         cy.get('.container').eq(2).sbvtCapture('Example1-ColorDiff-element')
//     });
//     // it(`should take a fullpage on: Example1/${base ? "Original": "FontDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/${ base ? `Original` : `FontDiff`}/index.html`)
//     //     cy.sbvtCapture('Example1-FontDiff', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example1/${base ? "Original": "MissingElement"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/${ base ? `Original` : `MissingElement`}/index.html`)
//     //     cy.sbvtCapture('Example1-MissingElement', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example1/${base ? "Original": "ContentDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/${ base ? `Original` : `ContentDiff`}/index.html`)
//     //     cy.sbvtCapture('Example1-ContentDiff', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     it(`should take a fullpage on: Example2/${basePage ? "Original": "ColorDiff"}`, function () {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/${ basePage ? `Original` : `ColorDiff`}/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     insertCustomFreezeScript ? win.eval(str) : ''
//                 })
//             })
//         cy.sbvtCapture('Example2-ColorDiff', {
//             lazyload: 500,
//             saveDOM: true,
//         })
//     });
//     // it(`should take a fullpage on: Example2/${basePage ? "Original": "FontDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/${ basePage ? `Original` : `FontDiff`}/index.html`)
//     //     cy.window()
//     //         .then((win) => {
//     //             cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//     //                 insertCustomFreezeScript ? win.eval(str) : ''
//     //             })
//     //         })
//     //     cy.sbvtCapture('Example2-FontDiff', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example2/${base ? "Original": "MissingElement"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/${ base ? `Original` : `MissingElement`}/index.html`)
//     //     cy.sbvtCapture('Example2-MissingElement', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example2/${basePage ? "Original": "ContentDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example2/${ basePage ? `Original` : `ContentDiff`}/index.html`)
//     //     cy.window()
//     //         .then((win) => {
//     //             cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//     //                 insertCustomFreezeScript ? win.eval(str) : ''
//     //             })
//     //         })
//     //     cy.sbvtCapture('Example2-ContentDiff', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     it(`should take a fullpage on: Example3/${basePage ? "Original": "ColorDiff"}`, function () {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/${ basePage ? `Original` : `ColorDiff`}/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     insertCustomFreezeScript ? win.eval(str) : ''
//                 })
//             })
//         cy.sbvtCapture('Example3-ColorDiff', {
//             // lazyload: 500,
//             saveDOM: true,
//         })
//     });
//     // it(`should take a fullpage on: Example3/${base ? "Original": "FontDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/${ base ? `Original` : `FontDiff`}/index.html`)
//     //     cy.sbvtCapture('Example3-FontDiff', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example3/${base ? "Original": "MissingElement"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/${ base ? `Original` : `MissingElement`}/index.html`)
//     //     cy.sbvtCapture('Example3-MissingElement', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example3/${base ? "Original": "ContentDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example3/${ base ? `Original` : `ContentDiff`}/index.html`)
//     //     cy.sbvtCapture('Example3-ContentDiff', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     it(`should take a fullpage on: Example4/${basePage ? "Original": "ColorDiff"}`, function () {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/${ basePage ? `Original` : `ColorDiff`}/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     insertCustomFreezeScript ? win.eval(str) : ''
//                 })
//             })
//         cy.sbvtCapture('Example4-ColorDiff', {
//             lazyload: 500,
//             saveDOM: true,
//         })
//     });
//     // it(`should take a fullpage on: Example4/${basePage ? "Original": "FontDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/${ basePage ? `Original` : `FontDiff`}/index.html`)
//     //     cy.window()
//     //         .then((win) => {
//     //             cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//     //                 insertCustomFreezeScript ? win.eval(str) : ''
//     //             })
//     //         })
//     //     cy.sbvtCapture('Example4-FontDiff', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example4/${base ? "Original": "MissingElement"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/${ base ? `Original` : `MissingElement`}/index.html`)
//     //     cy.sbvtCapture('Example4-MissingElement', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example4/${basePage ? "Original": "ContentDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example4/${ basePage ? `Original` : `ContentDiff`}/index.html`)
//     //     cy.window()
//     //         .then((win) => {
//     //             cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//     //                 insertCustomFreezeScript ? win.eval(str) : ''
//     //             })
//     //         })
//     //     cy.sbvtCapture('Example4-ContentDiff', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example5/${base ? "Original": "ColorDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/${ base ? `Original` : `ColorDiff`}/index.html`)
//     //     cy.sbvtCapture('Example5-ColorDiff', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     it(`should take a fullpage on: Example5/${basePage ? "Original": "FontDiff"}`, function () {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/${ basePage ? `Original` : `FontDiff`}/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     insertCustomFreezeScript ? win.eval(str) : ''
//                 })
//             })
//         cy.sbvtCapture('Example5-FontDiff', {
//             lazyload: 500,
//             saveDOM: true,
//         })
//     });
//     // it(`should take a fullpage on: Example5/${base ? "Original": "MissingElement"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/${ base ? `Original` : `MissingElement`}/index.html`)
//     //     cy.sbvtCapture('Example5-MissingElement', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example5/${basePage ? "Original": "ContentDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example5/${ basePage ? `Original` : `ContentDiff`}/index.html`)
//     //     cy.window()
//     //         .then((win) => {
//     //             cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//     //                 insertCustomFreezeScript ? win.eval(str) : ''
//     //             })
//     //         })
//     //     cy.sbvtCapture('Example5-ContentDiff', {
//     //         lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     it(`should take a fullpage on: Example6/${basePage ? "Original": "ColorDiff"}`, function () {
//         cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/${ basePage ? `Original` : `ColorDiff`}/index.html`)
//         cy.window()
//             .then((win) => {
//                 cy.readFile("./exampleFreezeCarousel.js").then((str) => {
//                     insertCustomFreezeScript ? win.eval(str) : ''
//                 })
//             })
//         cy.sbvtCapture('Example6-ColorDiff', {
//             lazyload: 500,
//             saveDOM: true,
//         })
//     });
//     // it(`should take a fullpage on: Example6/${base ? "Original": "FontDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/${ base ? `Original` : `FontDiff`}/index.html`)
//     //     cy.sbvtCapture('Example6-FontDiff', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example6/${base ? "Original": "MissingElement"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/${ base ? `Original` : `MissingElement`}/index.html`)
//     //     cy.sbvtCapture('Example6-MissingElement', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
//     // it(`should take a fullpage on: Example6/${base ? "Original": "ContentDiff"}`, function () {
//     //     cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example6/${ base ? `Original` : `ContentDiff`}/index.html`)
//     //     cy.sbvtCapture('Example6-ContentDiff', {
//     //         // lazyload: 500,
//     //         saveDOM: true,
//     //     })
//     // });
// })
//
//
//
