//
//
// Not currently running because of the cookie issue
//
//
// Cypress.on('uncaught:exception', (err, runnable) => {
//     // returning false here prevents Cypress from
//     // failing the test
//     return false
// })
//
// describe('template spec', () => {
//     beforeEach('visit cypress example website', () => {
//         cy.visit('https://app.visualtest.io/projects');
//         cy.wait(3000);
//         // cy.viewport(2500, 2080)
//     });
//
//     it('passes', () => {
//         cy.get('.Button-Container-Primary-Solid').click();
//
//         cy.origin('https://id.smartbear.com/login', () => {
//             // cy.get('#email').type('cypress@visual.test.com');
//             // cy.get('#password').type('asdfasdfasdf1A');
//             cy.get('#email').type('trevor147+39@live.com');
//             cy.get('#password').type('ENTER_PASSWORD');
//
//             cy.get('button.button_button__DsQxa:nth-child(3)').click();
//             cy.get(
//                 '#__next > div > div > main > div > div.container_container__dPV8a > form > button'
//             ).click();
//         });
//
//         cy.url().then((url) => {
//             if (url.includes('https://app.visualtest.io/login')) {
//                 cy.get(
//                     '[href="https://api.visualtest.io/auth/login?redirectTo=https%3A%2F%2Fapp.visualtest.io%2Fprojects"] > .Button-Container'
//                 ).click();
//             }
//         });
//
//         //Click on the test project
//         cy.get('[href="/projects/eJnmAXn1/testruns"] > .ProjectsRendered-Items-ProjectName').click();
//
//         cy.wait(3000)
//         cy.sbvtCapture('sbvt-project-view',{
//             // lazyload: 1000,
//             // scrollMethod: "JS_SCROLL"
//         })
//         //this is currently failing because cookies are cached, as mention in the README
//         cy.sbvtCapture('viewport', {
//             capture: 'viewport',
//         });
//
//         cy.get('.TestRunListPage-TestRunCard-Container').sbvtCapture('element-testruns')
//
//         //click create project and name it to be deleted
//         // cy.wait(3000);
//         // cy.get('.ProjectsRendered-Container-Header > .Button-Container').click();
//         // cy.get('.Input-Container > .undefined').type('to be deleted');
//         // cy.get('.Button-Container-Primary-Solid').click();
//         // cy.wait(3000);
//
//
//
//
//         // cy.get('.ProjectBar-Menu').click();
//         // cy.wait(3000);
//         //
//         // cy.get('.ProjectsRendered-Items-ProjectName').click();
//         // cy.get('.ProjectBar-Menu').click();
//         // cy.get(
//         //     '.ProjectAction-Container > .Card > :nth-child(2) > .Button-Container'
//         // ).click();
//         // cy.get('.ProjectDetail-Modal-Buttons > .Button-Container').click();
//     });
// });