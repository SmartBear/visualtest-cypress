describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    // @ts-ignore ignore because this is fixed when npx visualtest-setup is ran
    cy.sbvtCapture('ts-github-test')
  })
})