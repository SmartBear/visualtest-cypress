Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
});

const insertCustomFreezeScript = true;
let dataFromTest;
let scrolledTo;
describe('print-report-check', () => {
    it(`should take sbvtCapture`, () => {
        cy.visit("https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html").then(() => {

            cy.window()
                .then((win) => {
                    cy.readFile("./exampleFreezeCarousel.js").then((str) => {
                        if (insertCustomFreezeScript) win.eval(str);
                        cy.sbvtCapture("report-test-1",
                            {
                                capture: "viewport"
                            });
                        cy.sbvtCapture("report-test-2",
                            {
                                capture: "viewport"
                            });
                        cy.sbvtCapture("report-test-3",
                            {
                                capture: "viewport"
                            });
                        cy.sbvtPrintReport()
                    });
                });

        });
    });

});