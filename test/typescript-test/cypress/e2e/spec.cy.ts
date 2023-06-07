describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    // @ts-ignore
    cy.sbvtCapture('webkit-fullpage')
    // @ts-ignore
    cy.sbvtCapture('webkit-viewport', {
      capture: 'viewport'
    })
    // @ts-ignore
    cy.get('.banner').sbvtCapture('webkit-element')
    // @ts-ignore
    cy.sbvtPrintReport()
    // @ts-ignore
    cy.sbvtGetTestRunResult()
        .then((data) => {
          cy.task('log', {message: `sbvtGetTestRunResult printed using log task: ${JSON.stringify(data)}`});
        })
  })
})