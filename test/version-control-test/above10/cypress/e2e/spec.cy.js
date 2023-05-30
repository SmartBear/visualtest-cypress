describe('empty spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    cy.sbvtCapture('above10-test', {
      comparisonMode: "layout",
      sensitivity: "low"
    })  })
})