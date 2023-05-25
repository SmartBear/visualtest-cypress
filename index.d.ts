
declare namespace Cypress {

    interface Chainable<Subject> {

        /**
         * Take a screenshot using SmartBears VisualTest.
         *
         * @see https://support.smartbear.com/visualtest/docs/sdks/cypress.html
         *
         * @param {string} imageName
         *
         *
         * @param {Object} options
         * @param {string} options.capture - viewport or fullpage (for an element: chain off of cy.get)
         * @param {string} options.comparisonMode - layout or detailed
         * @param {string} options.sensitivity - how strict the comparison engine will be on the image (required if comparisonMode is 'layout')
         * @param {number} options.lazyload - milliseconds each scroll will take for the page to fully load
         * @param {string[]} options.ignoreElements - array of CssSelectors to ignore on the comparison
         *
         *
         *
         * @example
         *      cy.sbvtCapture("homepage", {
         *          comparisonMode: "layout",
         *          sensitivity: "medium"
         *      })
         * */

        sbvtCapture(imageName: string, options?: {
            capture?: 'viewport' | 'fullpage';
            lazyload?: number;
            comparisonMode?: 'layout' | 'detailed';
            sensitivity?: 'low' | 'medium' | 'high';
            ignoreElements?: string[];
        }): Chainable<any>;
    }
}

// declare namespace Cypress {
//     interface Chainable<Subject> {
//         /**
//          * Create several Todo items via UI
//          * @example
//          * cy.downloadFile('http://demourl','example','demo.pdf')
//          */
//         sbvtCapture(imageName: string): Chainable<any>
//     }
// }