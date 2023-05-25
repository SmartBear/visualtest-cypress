
//todo ... improve

declare namespace Cypress {
    interface Chainable {
        /**
         * Take a screenshot using SmartBears VisualTest.
         * @example cy.sbvtCapture('homepage')
         */
        sbvtCapture(name: string): Chainable;
    }
}