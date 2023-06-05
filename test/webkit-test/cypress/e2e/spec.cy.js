describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    cy.sbvtCapture('webkit-fullpage')
    cy.sbvtCapture('webkit-viewport', {
      capture: 'viewport'
    })
    cy.get('.banner').sbvtCapture('webkit-element')
  })
})