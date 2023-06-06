describe('tests a few captures on safari', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    cy.sbvtCapture('webkit-fullpage')
    cy.sbvtCapture('webkit-viewport', {
      capture: 'viewport'
    })
    cy.get('.banner').sbvtCapture('webkit-element')
    cy.sbvtPrintReport()
  })
})