
//todo ... improve

declare namespace Cypress {
    enum Sensitivity {
        Low = 'low',
        Medium = 'medium',
        High = 'high',
    }

    enum ComparisonMode {
        Detailed = 'detailed',
        Layout = 'layout'
    }

    interface Chainable {
        /**
         * Take a screenshot using SmartBears VisualTest.
         * @example cy.sbvtCapture('homepage')
         * @param {string} imageName
         * @param {Object} options
         * @param {string} options.capture - viewport or fullpage (for an element: chain off of cy.get)
         * @param {string} options.comparisonMode - layout or comparison
         * @param {string} options.sensitivity - how strict the comparison engine will be on the image (required if comparisonMode is 'layout')
         * @param {number} options.lazyload - milliseconds each scroll will take for the page to fully load
         * @param {string[]} options.ignoreElements - array of CssSelectors to ignore on the comparison
         * */

        sbvtCapture(imageName: string, options: {
            capture?: 'viewport' | 'fullpage';
            lazyload?: number;
            comparisonMode?: ComparisonMode;
            sensitivity: Sensitivity;
            ignoreElements?: string[];
        }): Chainable;
    }
}