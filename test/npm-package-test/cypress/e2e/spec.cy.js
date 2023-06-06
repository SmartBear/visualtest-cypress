describe('tests a few captures from the npm package', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    cy.sbvtCapture('npm-fullpage')
    cy.sbvtCapture('npm-viewport', {
      capture: 'viewport'
    })
    cy.get('.banner').sbvtCapture('npm-element')
    cy.sbvtPrintReport()
  })
})